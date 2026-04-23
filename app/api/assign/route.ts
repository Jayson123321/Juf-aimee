import { NextRequest, NextResponse } from "next/server";import { prisma } from "@/lib/db";
import { executeSearchOpp, searchOppTool, zoekBeginsituatie, zoekVolledigProfiel } from "@/app/ai/tools/search_opp";
import { GEN_MODEL, getEmbedding, ollama } from "@/lib/ollama";
import { getBloomLevelLabel, getStudentAge } from "@/lib/student-profile";
import { evalueerOpdrachtStreaming } from "@/lib/judge";

// ─── Types ───────────────────────────────────────────────────────────────────

type AssignmentApiStudent = {
  id: string;
  fullName: string;
  dateOfBirth?: Date | null;
  groep: string | null;
  bloomNiveau: number | null;
  profile: { currentSchoolYearGroup: string | null } | null;
  assignments: Array<{
    title: string;
    status: string;
    bloomLevel: string | null;
    teacherFeedback?: { content: string } | null;
  }>;
};

type RejectedAssignment = { title: string; reason: string };

// ─── Helper functions ─────────────────────────────────────────────────────────

function normalizeBloomLabel(label: string) {
  return label.replaceAll("ÃƒÂ«", "ë").replaceAll("Ã«", "ë");
}

function bloomLevelToNumber(label: string) {
  switch (normalizeBloomLabel(label)) {
    case "Onthouden": return 1;
    case "Begrijpen": return 2;
    case "Toepassen": return 3;
    case "Analyseren": return 4;
    case "Evalueren": return 5;
    case "Creëren": return 6;
    default: return 3;
  }
}

function parseGeneratedResponse(content: string) {
  const titleMatch = content.match(/TITLE:\s*(.+)/i);
  const assignmentMatch = content.match(/ASSIGN(?:MENT|ATION):\s*([\s\S]*?)RATIONALE:/i);
  const rationaleMatch = content.match(/RATIONALE:\s*([\s\S]*?)SOURCES:/i);

  return {
    title: titleMatch?.[1]?.trim() ?? "AI-gegenereerde opdracht",
    assignment: assignmentMatch?.[1]?.trim() ?? content.trim(),
    rationale: rationaleMatch?.[1]?.trim() ?? "",
  };
}

function inferDateOfBirthFromSources(sources: string[]): Date | null {
  for (const source of sources) {
    if (!source.toLowerCase().includes("geboortedatum")) continue;
    const match = source.match(/(\d{1,2})[\-/.](\d{1,2})[\-/.](\d{4})/);
    if (!match) continue;
    const [d, m, y] = [Number(match[1]), Number(match[2]), Number(match[3])];
    if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) continue;
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) return date;
  }
  return null;
}

function extractProfileInterestsFromSources(sources: string[]): string[] {
  const snippets = new Set<string>();
  const patterns = [
    /[^.\n]{0,80}interesse[^.\n]{0,140}[.\n]?/gi,
    /[^.\n]{0,80}nieuwsgierig[^.\n]{0,140}[.\n]?/gi,
    /[^.\n]{0,80}analytisch sterk[^.\n]{0,140}[.\n]?/gi,
    /[^.\n]{0,80}wil graag autonomie[^.\n]{0,140}[.\n]?/gi,
  ];
  for (const source of sources) {
    for (const pattern of patterns) {
      for (const raw of source.match(pattern) ?? []) {
        const cleaned = raw.replace(/\s+/g, " ").trim();
        if (cleaned.length >= 12) snippets.add(cleaned);
      }
    }
  }
  return [...snippets].slice(0, 3);
}

function buildGenerationPrompt(args: {
  student: AssignmentApiStudent;
  resolvedBloom: string;
  focusArea: string;
  teacherPrompt?: string;
  currentAssignment?: { title?: string; assignment?: string; rationale?: string } | null;
  rejectedAssignments?: RejectedAssignment[];
}) {
  const { student, resolvedBloom, focusArea, teacherPrompt, currentAssignment, rejectedAssignments } = args;

  return `Je bent Juf Aimee: een deskundige in hoogbegaafdheidsonderwijs op de basisschool.

Je taak is een gepersonaliseerde verrijkingsopdracht maken voor een hoogbegaafde leerling.
Gebruik eenvoudig, helder Nederlands zonder abstracte begrippen.

STAP 1 — Gebruik de search_opp tool om het volgende op te halen:
- Zoek naar interesses en passies van de leerling (dit zijn de ENIGE interesses die je mag gebruiken)
- Zoek naar afgekeurde opdrachten en leerkrachtfeedback — deze onderwerpen en formats zijn VERBODEN
- Zoek naar beginsituatie, leerniveau en werkhouding
- Zoek naar zwakke vakgebieden van de leerling

STAP 2 — Maak de opdracht op basis van wat je hebt gevonden.

HARDE EISEN:
1. De opdracht gaat over het schoolvak: ${focusArea || "een schoolvak naar keuze"}
2. De opdracht past bij Bloom-niveau: ${resolvedBloom}
3. Gebruik ALLEEN interesses die je via search_opp hebt gevonden — negeer alle andere profieldata over interesses
4. Als de leerling zwak is in schrijven/taal: maak GEEN schrijfopdracht tenzij het vak dit vereist
5. Afgekeurde opdrachten: genereer NOOIT een opdracht die lijkt op eerder afgekeurde opdrachten qua thema of format
6. De opdracht is praktisch en concreet, niet abstract

LEERLING
Naam: ${student.fullName}
Student ID: ${student.id}
Groep: ${student.profile?.currentSchoolYearGroup ?? student.groep ?? "onbekend"}
Bloom niveau: ${resolvedBloom}

HUIDIGE VERSIE
${currentAssignment
  ? `Titel: ${currentAssignment.title ?? "onbekend"}\nOpdracht:\n${currentAssignment.assignment ?? ""}`
  : "Er is nog geen eerdere versie."}

INSTRUCTIE VAN DE LEERKRACHT
${teacherPrompt || "Maak de best passende eerste versie."}

VERBODEN ONDERWERPEN EN FORMATS (uit afgekeurde opdrachten)
${rejectedAssignments?.length
  ? rejectedAssignments.map((r) => `- "${r.title}": ${r.reason}`).join("\n")
  : "Geen afgekeurde opdrachten bekend."}

Geef exact dit formaat terug:
TITLE: <korte titel>
ASSIGNMENT:
<concrete opdracht in verzorgd Nederlands, 5-8 zinnen>
RATIONALE:
<2-4 zinnen waarom deze opdracht past bij de leerling, met verwijzing naar specifieke interesses uit het OPP>
SOURCES:
<bronnen die je hebt gebruikt>`;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    action,
    studentId,
    focusArea = "",
    bloomLevel = "",
    teacherPrompt = "",
    currentAssignment = null,
  } = body ?? {};

  if (!studentId || !action) {
    return NextResponse.json({ error: "studentId en action zijn verplicht." }, { status: 400 });
  }

  // Haal de student op uit de database
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      profile: { select: { currentSchoolYearGroup: true, schoolHistory: true } },
      assignments: {
        select: { title: true, status: true, bloomLevel: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Student niet gevonden." }, { status: 404 });
  }

  const resolvedBloom = normalizeBloomLabel(bloomLevel || getBloomLevelLabel(student.bloomNiveau));

  try {
    // Haal OPP-bronnen op (profiel + leerkrachtfeedback)
    const [profileSources, feedbackChunks] = await Promise.all([
      zoekVolledigProfiel(student.id, focusArea),
      prisma.oppChunk.findMany({
        where: { studentId: student.id, tekst: { contains: "[LEERKRACHT FEEDBACK" } },
        select: { tekst: true },
        orderBy: { id: "desc" },
        take: 5,
      }),
    ]);
    const sources = [...new Set([...profileSources, ...feedbackChunks.map((c) => c.tekst)])];

    // ── Actie: bronnen zoeken ──────────────────────────────────────────────────
    if (action === "search") {
      return NextResponse.json({ sources });
    }

    // ── Actie: goedkeuren ─────────────────────────────────────────────────────
    if (action === "approve") {
      if (!currentAssignment?.assignment || !currentAssignment?.title) {
        return NextResponse.json({ error: "Geen opdracht beschikbaar om goed te keuren." }, { status: 400 });
      }
      const saved = await prisma.assignment.create({
        data: {
          studentId: student.id,
          title: currentAssignment.title,
          description: currentAssignment.assignment,
          uitleg: currentAssignment.rationale ?? "Goedgekeurde opdracht",
          bloomLevel: resolvedBloom,
          bloomNiveau: bloomLevelToNumber(resolvedBloom),
          status: "PENDING",
        },
      });
      return NextResponse.json({ ok: true, savedAssignmentId: saved.id });
    }

    // ── Actie: afkeuren ───────────────────────────────────────────────────────
    if (action === "reject") {
      const { rejectReason, assignmentTitle } = body ?? {};
      if (!rejectReason?.trim()) {
        return NextResponse.json({ error: "Reden van afkeuring is verplicht." }, { status: 400 });
      }
      const feedbackText = `[LEERKRACHT FEEDBACK - afgekeurde opdracht]\nOpdrachttitel: "${assignmentTitle ?? "onbekend"}"\nReden van afkeuring: "${rejectReason.trim()}"`;
      try {
        const embedding = await getEmbedding(feedbackText);
        await prisma.$executeRaw`
          INSERT INTO "OppChunk" ("studentId", "tekst", "embedding")
          VALUES (${student.id}, ${feedbackText}, ${`[${embedding.join(",")}]`}::vector)
        `;
      } catch {
        await prisma.$executeRaw`INSERT INTO "OppChunk" ("studentId", "tekst") VALUES (${student.id}, ${feedbackText})`;
      }
      return NextResponse.json({ ok: true });
    }

    // ── Actie: feedback opslaan ───────────────────────────────────────────────
    if (action === "feedback") {
      const { assignmentId, feedback } = body ?? {};
      if (!feedback?.trim()) {
        return NextResponse.json({ error: "Feedback is verplicht." }, { status: 400 });
      }
      const feedbackText = `[LEERKRACHT FEEDBACK - goedgekeurde opdracht]\nOpdracht ID: "${assignmentId ?? "onbekend"}"\nFeedback: "${feedback.trim()}"`;
      try {
        const embedding = await getEmbedding(feedbackText);
        await prisma.$executeRawUnsafe(
          `INSERT INTO "OppChunk" ("studentId", "tekst", "embedding") VALUES ($1, $2, $3::vector)`,
          student.id, feedbackText, `[${embedding.join(",")}]`,
        );
      } catch {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "OppChunk" ("studentId", "tekst") VALUES ($1, $2)`,
          student.id, feedbackText,
        );
      }
      return NextResponse.json({ ok: true });
    }

    // ── Actie: genereren / aanpassen ──────────────────────────────────────────
    if (action !== "generate" && action !== "revise") {
      return NextResponse.json({ error: "Onbekende actie." }, { status: 400 });
    }
    if (action === "revise" && !teacherPrompt.trim()) {
      return NextResponse.json({ error: "Geef eerst een instructie mee voor de aanpassing." }, { status: 400 });
    }

    // Geboortedatum afleiden uit bronnen als die ontbreekt
    const inferredDateOfBirth = student.dateOfBirth ?? inferDateOfBirthFromSources(sources);
    if (!student.dateOfBirth && inferredDateOfBirth) {
      await prisma.student.update({ where: { id: student.id }, data: { dateOfBirth: inferredDateOfBirth } });
    }

    // Informatie voor de judge
    const leeftijd = getStudentAge(inferredDateOfBirth);
    const interestSnippets = extractProfileInterestsFromSources(sources);
    const beginsituatieBronnen = await zoekBeginsituatie(student.id);
    const beginsituatie = beginsituatieBronnen.join("\n\n").slice(0, 800) || "Geen OPP-informatie beschikbaar.";

    // Afgekeurde opdrachten ophalen (mogen niet opnieuw gegenereerd worden)
    const rejectedChunks = await prisma.oppChunk.findMany({
      where: { studentId: student.id, tekst: { contains: "[LEERKRACHT FEEDBACK - afgekeurde opdracht]" } },
      select: { tekst: true },
    });
    const rejectedAssignments: RejectedAssignment[] = rejectedChunks.map(({ tekst }) => ({
      title: tekst.match(/Opdrachttitel:\s*"([^"]+)"/)?.[1] ?? "onbekend",
      reason: tekst.match(/Reden van afkeuring:\s*"([^"]+)"/)?.[1] ?? tekst,
    }));

    const prompt = buildGenerationPrompt({ student, resolvedBloom, focusArea, teacherPrompt, currentAssignment, rejectedAssignments });

    // Stap 1: Eerste aanroep — AI roept de search_opp tool aan om het OPP te doorzoeken
    const firstResponse = await ollama.chat({
      model: GEN_MODEL,
      messages: [{ role: "user", content: prompt }],
      tools: [searchOppTool],
      options: { temperature: 0.3, think: false } as never,
    });

    const messages: { role: string; content: string }[] = [
      { role: "user", content: prompt },
      { role: "assistant", content: firstResponse.message.content ?? "" },
    ];

    // Tool calls uitvoeren (zoekresultaten terugkoppelen aan de AI)
    for (const toolCall of firstResponse.message.tool_calls ?? []) {
      const { student_id, query } = toolCall.function.arguments;
      const result = await executeSearchOpp(student_id, query, 3);
      messages.push({ role: "tool", content: typeof result === "string" ? result : JSON.stringify(result) });
    }

    // Stap 2: Tweede aanroep — AI genereert de opdracht op basis van de gevonden bronnen
    const genResponse = await ollama.chat({
      model: GEN_MODEL,
      messages,
      options: { temperature: 0.3, num_predict: 1500 },
    });

    const parsed = parseGeneratedResponse(genResponse.message.content ?? "");

    // Stap 3: Judge beoordeelt de gegenereerde opdracht op 8 criteria
    const judgeResult = await evalueerOpdrachtStreaming(
      {
        naam: student.fullName,
        leeftijd: leeftijd ? `${leeftijd} jaar` : "onbekend",
        interesses: interestSnippets.length > 0
          ? interestSnippets.map((s) => `"${s}"`).join("; ")
          : "Niet expliciet benoemd in OPP-bronnen",
        bloomNiveau: resolvedBloom,
        vak: focusArea || "Algemeen",
        beginsituatie,
        gegenereerdeOpdracht: parsed.assignment,
        volledigOpp: sources.join("\n\n---\n\n"),
      },
      () => {}, // geen streaming nodig — resultaat wordt in één keer teruggegeven
    );

    return NextResponse.json({ sources, assignment: parsed, judgeResult });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Opdracht genereren mislukt." },
      { status: 500 },
    );
  }
}
