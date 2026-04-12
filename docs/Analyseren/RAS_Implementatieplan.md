# RAS Implementatieplan

## Overzicht

Dit document beschrijft stap voor stap hoe de **RAS pipeline** (Retrieval, Analysis, Structure) als aanvulling op de bestaande Agentic RAG aanpak wordt geïntegreerd in de Juf Aimee codebase.

RAS **vervangt Agentic RAG niet** — het bouwt er bovenop. De OPP vector search (het hart van Agentic RAG) blijft de basis. RAS voegt daar een tweede retrieval kanaal aan toe: de **leerlinggeschiedenis** — een opeenstapeling van afgeronde opdrachten, leerkrachtfeedback en leerlingreflecties over tijd.

De leerlinggeschiedenis is de kern van de meerwaarde van RAS. Het zijn de dynamische patronen die het verschil maken:
- Waar liep de leerling steeds tegenaan?
- Wat vond de leerkracht herhaaldelijk belangrijk?
- Wat leerde de leerling zelf over zijn eigen aanpak?

Die patronen maken het mogelijk om niet alleen een relevante opdracht te genereren, maar een opdracht die **aansluit op de ontwikkeling van de leerling over tijd**.

```
Agentic RAG:  OPP vector search → genereer opdracht (elke keer opnieuw)
RAS:          OPP vector search
            + leerlinggeschiedenis (patronen uit feedback + reflecties)  → analyseer → genereer opdracht
```

---

## Huidige situatie

| Bestand | Rol |
|---|---|
| `app/api/prototype/assignment/route.ts` | Doet alles: OPP search, prompt bouwen, LLM call, rejection opslaan |
| `lib/tools/searchDocs.ts` | Vector search op OppChunk tabel |
| `lib/ollama.ts` | Ollama client + embedding functie |
| `lib/db.ts` | Prisma client |

**Knelpunten in de huidige aanpak:**
- Rejection feedback wordt opgeslagen als `OppChunk` met prefix — onnauwkeurig en moeilijk te queryen
- leerling data die meegestuurd wordt: alleen `title`, `status`, `bloomLevel` — geen feedback of reflectie
- Alles staat in één `route.ts` — moeilijk te onderhouden en uit te breiden

---

## Doelarchitectuur

```
lib/
├── ras/
│   ├── pipeline.ts          ← orkestreert retrieval + analyse + generatie
│   ├── retrievePortfolio.ts ← haalt completed assignments op met feedback + reflecties
│   └── structureContext.ts  ← combineert OPP + portfolio, extraheert patronen
├── db.ts                    (ongewijzigd)
└── ollama.ts                (ongewijzigd)

app/api/prototype/assignment/
└── route.ts                 ← generate/revise roept pipeline.ts aan, reject slaat TeacherFeedback op
```

---

## Stap 1 — Migratie draaien

**Vereiste:** Schema is al bijgewerkt op branch `feature/ras-prisma-schema` met `TeacherFeedback` en `Reflection` modellen.

```bash
npx prisma migrate dev --name add-teacher-feedback-and-reflection
```

Dit maakt de twee nieuwe tabellen aan in de database. Daarna:

```bash
npx prisma generate
```

**Resultaat:** `TeacherFeedback` en `Reflection` tabellen beschikbaar in de database.

---

## Stap 2 — `lib/ras/retrieveLeerlinggeschiedenis.ts` aanmaken

Haalt de leerlinggeschiedenis op: de laatste N afgeronde opdrachten inclusief leerkrachtfeedback en leerlingreflecties. Dit zijn de dynamische patronen die RAS onderscheiden van Agentic RAG.

```ts
import { prisma } from "@/lib/db";

export async function retrieveLeerlinggeschiedenis(studentId: string, take = 5) {
  return prisma.assignment.findMany({
    where: {
      studentId,
      status: "COMPLETED",
    },
    include: {
      teacherFeedback: true,
      reflection: true,
    },
    orderBy: { updatedAt: "desc" },
    take,
  });
}
```

**Wat het teruggeeft per opdracht:**
- `title`, `bloomNiveau`, `bloomLevel` — wat voor opdracht het was en op welk niveau
- `studentWork` — het ingeleverde werk van de leerling
- `teacherFeedback.content` — geschreven feedback van de leerkracht
- `reflection.content` — zelfreflectie van de leerling: wat vond de leerling moeilijk, wat leerde hij

**Samen vormen deze velden de leerlinggeschiedenis** — niet een losse lijst opdrachten, maar een tijdlijn van ontwikkeling waaruit patronen te extraheren zijn.

---

## Stap 3 — `lib/ras/structureContext.ts` aanmaken

Extraheert patronen uit de leerlinggeschiedenis en koppelt die aan de OPP-doelen. Dit is de Analysis Layer — het verschil tussen data doorgeven en begrijpen wat de leerling nodig heeft.

```ts
type OppChunk = { tekst: string; score: number };
type LeerlinggeschiedenisItem = {
  title: string;
  bloomLevel: string | null;
  studentWork: string | null;
  teacherFeedback: { content: string } | null;
  reflection: { content: string } | null;
};

export function structureContext(oppChunks: OppChunk[], geschiedenis: LeerlinggeschiedenisItem[]) {
  const oppContext = oppChunks
    .map((c, i) => `Bron ${i + 1} (score: ${c.score.toFixed(2)}): "${c.tekst}"`)
    .join("\n");

  // Tijdlijn van de leerling — patronen over tijd zichtbaar maken
  const geschiedenisContext = geschiedenis
    .map((a) => {
      const lines = [`Opdracht: "${a.title}" (Bloom: ${a.bloomLevel ?? "onbekend"})`];
      if (a.studentWork) lines.push(`  Ingeleverd werk: ${a.studentWork}`);
      if (a.teacherFeedback) lines.push(`  Leerkracht feedback: ${a.teacherFeedback.content}`);
      if (a.reflection) lines.push(`  Leerlingreflectie: ${a.reflection.content}`);
      return lines.join("\n");
    })
    .join("\n\n");

  // Terugkerende patronen extraheren uit feedback en reflecties
  const terugkerendePatronen = geschiedenis
    .filter((a) => a.teacherFeedback || a.reflection)
    .map((a) => a.teacherFeedback?.content ?? a.reflection?.content ?? "")
    .filter(Boolean);

  return { oppContext, geschiedenisContext, terugkerendePatronen };
}
```

---

## Stap 4 — `lib/ras/pipeline.ts` aanmaken

Orkestreert de volledige RAS pipeline: parallel retrieval → structureren → één LLM call.

```ts
import { retrievePortfolio } from "./retrievePortfolio";
import { structureContext } from "./structureContext";
import { executeSearchOpp } from "@/app/ai/tools/search_opp";
import { GEN_MODEL, ollama } from "@/lib/ollama";

export async function runRasPipeline(args: {
  studentId: string;
  studentName: string;
  groep: string;
  bloomLabel: string;
  focusArea: string;
  teacherPrompt?: string;
  currentAssignment?: { title?: string; assignment?: string; rationale?: string } | null;
}) {
  const { studentId, studentName, groep, bloomLabel, focusArea, teacherPrompt, currentAssignment } = args;

  // Parallel retrieval — OPP (RAG basis) + leerlinggeschiedenis (RAS aanvulling)
  const query = [focusArea, bloomLabel, `passende opdracht voor ${studentName}`, "interesses", "onderwijsbehoeften"].join(", ");
  const [searchResults, geschiedenis] = await Promise.all([
    executeSearchOpp(studentId, query, 5),            // altijd uitgevoerd (RAG basis)
    retrieveLeerlinggeschiedenis(studentId, 5),        // leeg als leerling geen geschiedenis heeft
  ]);

  // Structureer context — extraheer patronen uit leerlinggeschiedenis
  const oppChunks = parseOppResults(searchResults);
  const { oppContext, geschiedenisContext, terugkerendePatronen } = structureContext(oppChunks, geschiedenis);

  // Bouw unified prompt
  const prompt = buildUnifiedPrompt({
    studentName, groep, bloomLabel, focusArea,
    oppContext, geschiedenisContext, terugkerendePatronen,
    teacherPrompt, currentAssignment,
  });

  // Één LLM call
  const response = await ollama.chat({
    model: GEN_MODEL,
    messages: [{ role: "user", content: prompt }],
    options: { temperature: 0.3, num_predict: 500 },
  });

  return response.message.content?.trim() ?? "";
}
```

---

## Stap 5 — `route.ts` updaten

### A) `generate` en `revise` actions

Vervang de huidige `buildGenerationPrompt` + directe `ollama.chat` aanroep door:

```ts
const content = await runRasPipeline({
  studentId: student.id,
  studentName: student.fullName,
  groep: student.profile?.currentSchoolYearGroup ?? student.groep ?? "onbekend",
  bloomLabel: resolvedBloom,
  focusArea,
  teacherPrompt,
  currentAssignment,
});
```

### B) `reject` action

Huidige aanpak (verwijderen):
```ts
// Feedback wordt opgeslagen als OppChunk met prefix
await prisma.$executeRaw`INSERT INTO "OppChunk" ...`
```

Nieuwe aanpak:
```ts
// Feedback wordt opgeslagen als TeacherFeedback record
const assignment = await prisma.assignment.findFirst({
  where: { studentId: student.id, title: assignmentTitle },
  orderBy: { createdAt: "desc" },
});

if (assignment) {
  await prisma.teacherFeedback.create({
    data: {
      assignmentId: assignment.id,
      content: rejectReason.trim(),
    },
  });
}
```

---

## Uitvoervolgorde

| # | Stap | Bestand | Afhankelijk van |
|---|---|---|---|
| 1 | Migratie draaien | — | Schema (klaar) |
| 2 | Leerlinggeschiedenis ophalen | `lib/ras/retrieveLeerlinggeschiedenis.ts` | Migratie |
| 3 | Context structureren | `lib/ras/structureContext.ts` | Stap 2 |
| 4 | Pipeline orkestratie | `lib/ras/pipeline.ts` | Stap 2 + 3 |
| 5a | Route: generate/revise | `route.ts` | Stap 4 |
| 5b | Route: reject action | `route.ts` | Migratie |

---

## Wat niet verandert

- `lib/tools/searchDocs.ts` — OPP vector search blijft ongewijzigd, wordt aangeroepen vanuit de pipeline
- `lib/ollama.ts` — Ollama client ongewijzigd
- `lib/db.ts` — Prisma client ongewijzigd
- Het frontend van de prototype pagina — zelfde API interface, zelfde acties

---

## Gedrag zonder portfolio (graceful degradation)

RAS is een aanvulling op Agentic RAG, geen vervanging. Dit betekent:

| Situatie | Gedrag |
|---|---|
| Leerling heeft geen afgeronde opdrachten | Pipeline gebruikt alleen OPP bronnen — identiek aan huidig RAG gedrag |
| Leerling heeft opdrachten maar nog geen feedback/reflectie | Pipeline gebruikt OPP + opdrachttitels/bloom niveaus |
| Leerling heeft volledige leerlinggeschiedenis | Pipeline extraheert patronen uit feedback + reflecties — volledig RAS gedrag |

Het systeem verbetert dus **progressief** naarmate de leerlinggeschiedenis groeit, zonder dat bestaande functionaliteit breekt.

## Na implementatie: leerlinggeschiedenis laten opbouwen

De leerlinggeschiedenis heeft data nodig om meerwaarde te geven. Dit vereist later frontend werk (buiten de scope van dit plan):

- **TeacherFeedback** — leerkracht geeft feedback op een afgeronde opdracht
- **Reflection** — leerling vult zelfreflectie in na het afronden van een opdracht

Hoe meer leerlinggeschiedenis beschikbaar is, hoe beter de patronen zijn die RAS kan extraheren en hoe persoonlijker de gegenereerde opdrachten worden.
