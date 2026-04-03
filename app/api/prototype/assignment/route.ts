import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { executeSearchOpp } from "@/app/ai/tools/search_opp";
import { GEN_MODEL, getEmbedding, ollama } from "@/lib/ollama";
import { getBloomLevelLabel } from "@/lib/student-presentation";

type PrototypeAssignmentApiStudent = {
  id: string;
  fullName: string;
  groep: string | null;
  bloomNiveau: number;
  profile: {
    currentSchoolYearGroup: string | null;
  } | null;
  assignments: Array<{
    title: string;
    status: string;
    bloomLevel: string | null;
  }>;
};

function parseSearchResults(results: string) {
  return results
    .split(/\[Resultaat \d+ - score: [^\]]+\]\n/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildSearchQuery(focusArea: string, bloomLevel: string, fullName: string) {
  return [
    focusArea || "onderwijsbehoeften",
    bloomLevel,
    `passende opdracht voor ${fullName}`,
    "integratief beeld",
    "interesses",
    "sterke punten",
    "onderwijsbehoeften",
    "motivatie",
  ]
    .filter(Boolean)
    .join(", ");
}

function parseGeneratedResponse(content: string) {
  const titleMatch = content.match(/TITLE:\s*(.+)/i);
  const assignmentMatch = content.match(/ASSIGN(?:MENT|ATION):\s*([\s\S]*?)RATIONALE:/i);
  const rationaleMatch = content.match(/RATIONALE:\s*([\s\S]*?)SOURCES:/i);

  const title = titleMatch?.[1]?.trim() ?? "AI-gegenereerde opdracht";
  const assignment = assignmentMatch?.[1]?.trim() ?? content.trim();
  const rationale = rationaleMatch?.[1]?.trim() ?? "";

  return { title, assignment, rationale };
}

function normalizeBloomLabel(label: string) {
  return label.replaceAll("ÃƒÂ«", "ë").replaceAll("Ã«", "ë");
}

function bloomLevelToNumber(label: string) {
  switch (normalizeBloomLabel(label)) {
    case "Onthouden":
      return 1;
    case "Begrijpen":
      return 2;
    case "Toepassen":
      return 3;
    case "Analyseren":
      return 4;
    case "Evalueren":
      return 5;
    case "Creëren":
      return 6;
    default:
      return 3;
  }
}

function buildGenerationPrompt(args: {
  student: PrototypeAssignmentApiStudent;
  resolvedBloom: string;
  focusArea: string;
  sources: string[];
  teacherPrompt?: string;
  currentAssignment?: {
    title?: string;
    assignment?: string;
    rationale?: string;
  } | null;
}) {
  const { student, resolvedBloom, focusArea, sources, teacherPrompt, currentAssignment } = args;

  return `Je bent Juf Aimee en genereert een gepersonaliseerde opdracht voor een hoogbegaafde leerling.

BELANGRIJK: Als er in de OPP BRONNEN een regel staat die begint met "[LEERKRACHT FEEDBACK - afgekeurde opdracht]", dan moet je die feedback serieus nemen. Vermijd het onderwerp of de aanpak die is afgekeurd en kies een andere richting die wél aansluit op de leerling.

Noem in je uitleg expliciet wanneer je op basis van zo'n eerdere feedback juist een bepaald type opdracht of materiaal níet meer kiest (bijvoorbeeld geen fysieke waterfilter meer), en leg kort uit wat je daar in de nieuwe opdracht voor in de plaats doet.

Geef exact dit formaat terug:
TITLE: <korte titel>
ASSIGNMENT:
<een concrete opdracht in verzorgd Nederlands, 5-8 zinnen, gericht aan de leerkracht>
RATIONALE:
<2-4 zinnen waarom deze opdracht past bij de leerling. Noem expliciet het geselecteerde Bloom-niveau (${resolvedBloom}) en leg kort uit waarom de opdracht goed aansluit bij dit Bloom-niveau. Verwijs ook kort naar de gebruikte informatiebronnen (bijvoorbeeld OPP-teksten, eerdere opdrachten, eerdere afgekeurde opdrachten/feedback of kenmerken van de leerling) waarop je redenering is gebaseerd.

BELANGRIJK: Noem alléén interesses, sterktes, voorkeuren of kenmerken van de leerling die letterlijk of bijna letterlijk in de OPP BRONNEN, RECENTE OPDRACHTEN of INSTRUCTIE VAN DE LEERKRACHT voorkomen. Verzín geen nieuwe interesses of eigenschappen en gebruik geen synoniemen die niet in de bron staan (bijvoorbeeld niet "technologie" als in de bron alleen "muziek" staat).

Noem daarbij minimaal één concreet kenmerk uit het leerlingprofiel of de OPP (bijvoorbeeld een interesse of sterkte) en citeer daarbij heel kort uit de bron. Gebruik hierbij een generiek format zoals: "Uit OPP-fragment: '<korte originele tekst uit de bron>' concludeer ik dat...". Gebruik nooit het voorbeeld uit deze instructie letterlijk; vul altijd een écht citaat uit de relevante bron in. Leg uit waarom het aansluiten bij die interesse belangrijk is voor een hoogbegaafde leerling (bijvoorbeeld omdat dit leidt tot meer gestimuleerd en taakgericht gedrag).

Verwijs daarnaast altijd kort naar minimaal één echte onderwijskundige of psychologische bron (bijvoorbeeld een studie of theorie van Ryan & Deci over motivatie en autonomie, of een vergelijkbare bron) om te onderbouwen dat aansluiten bij interesses en autonomie belangrijk is voor de motivatie van (hoogbegaafde) leerlingen. Leg in één zin uit wat de kernboodschap van die studie/theorie is en hoe die jouw opdrachtkeuze ondersteunt. Varieer in de gekozen bron; gebruik niet in elke opdracht dezelfde auteurs, maar kies de studie die het beste past bij deze specifieke opdracht.

Als er relevante [LEERKRACHT FEEDBACK - afgekeurde opdracht] is, benoem expliciet op basis van welk concreet feedbackfragment (kort citeren) je bepaalde keuzes juist níet meer maakt en welke alternatieve aanpak je daarvoor kiest.>
SOURCES:
<een korte bronregel per gebruikte bron. Maak duidelijk of de informatie uit een OPP-fragment, eerdere opdracht, theorie/studie (met APA-verwijzing) of andere context komt, zodat helder is waarop de opdrachtinhoud is gebaseerd. Zorg dat ten minste één bronregel een correcte, beknopte APA-bronvermelding bevat voor de onderwijskundige/psychologische studie of theorie die je in de RATIONALE noemt.>

Gebruik alleen de onderstaande context.

LEERLING
Naam: ${student.fullName}
Groep: ${student.profile?.currentSchoolYearGroup ?? student.groep ?? "onbekend"}
Bloom niveau: ${resolvedBloom}

Gebruik de OPP BRONNEN en RECENTE OPDRACHTEN hieronder om interesses, leerstijl, werkmethode, concentratie en sterktes van de leerling af te leiden. Voeg géén extra leerlingkenmerken toe die niet uit deze databasebronnen komen.

RECENTE OPDRACHTEN
${student.assignments.map((assignment) => `- ${assignment.title} (${assignment.bloomLevel ?? "geen Bloom label"}, ${assignment.status})`).join("\n") || "- Geen recente opdrachten"}

OPP BRONNEN
${sources.join("\n\n") || "Geen OPP-bronnen gevonden."}

FOCUSGEBIED
${focusArea || "Kies een logisch focusgebied op basis van interesses en OPP."}

HUIDIGE VERSIE
${currentAssignment ? `Titel: ${currentAssignment.title ?? "onbekend"}\nOpdracht:\n${currentAssignment.assignment ?? ""}\nMotivatie:\n${currentAssignment.rationale ?? ""}` : "Er is nog geen eerdere versie."}

INSTRUCTIE VAN DE LEERKRACHT
${teacherPrompt || "Maak de best passende eerste versie."}`;
}

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

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      profile: true,
      assignments: {
        select: {
          title: true,
          status: true,
          bloomLevel: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Student niet gevonden." }, { status: 404 });
  }

  const resolvedBloom = normalizeBloomLabel(
    bloomLevel || getBloomLevelLabel(student.bloomNiveau),
  );
  const query = buildSearchQuery(focusArea, resolvedBloom, student.fullName);

  try {
    const searchResults = await executeSearchOpp(student.id, query, 5);
    const sources = parseSearchResults(searchResults);

    if (action === "search") {
      return NextResponse.json({ sources, query });
    }

    if (action === "approve") {
      if (!currentAssignment?.assignment || !currentAssignment?.title) {
        return NextResponse.json(
          { error: "Geen opdracht beschikbaar om goed te keuren." },
          { status: 400 },
        );
      }

      const savedAssignment = await prisma.assignment.create({
        data: {
          studentId: student.id,
          title: currentAssignment.title,
          description: currentAssignment.assignment,
          uitleg: currentAssignment.rationale ?? "Goedgekeurde prototype-opdracht",
          bloomLevel: resolvedBloom,
          bloomNiveau: bloomLevelToNumber(resolvedBloom),
          status: "PENDING",
        },
      });

      return NextResponse.json({
        ok: true,
        savedAssignmentId: savedAssignment.id,
      });
    }

    if (action === "reject") {
      const { rejectReason, assignmentTitle } = body ?? {};

      if (!rejectReason?.trim()) {
        return NextResponse.json({ error: "Reden van afkeuring is verplicht." }, { status: 400 });
      }

      const feedbackText = `[LEERKRACHT FEEDBACK - afgekeurde opdracht]\nOpdrachttitel: "${assignmentTitle ?? "onbekend"}"\nReden van afkeuring: "${rejectReason.trim()}"`;

      try {
        const embedding = await getEmbedding(feedbackText);
        const vectorStr = `[${embedding.join(",")}]`;
        await prisma.$executeRaw`
          INSERT INTO "OppChunk" ("studentId", "tekst", "embedding")
          VALUES (${student.id}, ${feedbackText}, ${vectorStr}::vector)
        `;
      } catch {
        // Sla op zonder embedding als de embedding mislukt
        await prisma.$executeRaw`
          INSERT INTO "OppChunk" ("studentId", "tekst")
          VALUES (${student.id}, ${feedbackText})
        `;
      }

      return NextResponse.json({ ok: true });
    }

    if (action !== "generate" && action !== "revise") {
      return NextResponse.json({ error: "Onbekende actie." }, { status: 400 });
    }

    if (action === "revise" && !teacherPrompt.trim()) {
      return NextResponse.json(
        { error: "Geef eerst een instructie mee voor de aanpassing." },
        { status: 400 },
      );
    }

    const prompt = buildGenerationPrompt({
      student,
      resolvedBloom,
      focusArea,
      sources,
      teacherPrompt,
      currentAssignment,
    });

    const response = await ollama.chat({
      model: GEN_MODEL,
      messages: [{ role: "user", content: prompt }],
      options: { temperature: 0.3, num_predict: 500 },
    });

    const content = response.message.content?.trim() ?? "";
    const parsed = parseGeneratedResponse(content);

    return NextResponse.json({
      sources,
      assignment: {
        ...parsed,
        sources,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Prototype-opdracht genereren mislukt. Controleer database en Ollama.",
      },
      { status: 500 },
    );
  }
}
