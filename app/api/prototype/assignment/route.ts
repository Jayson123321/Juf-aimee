import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { executeSearchOpp } from "@/app/ai/tools/search_opp";
import { GEN_MODEL, ollama } from "@/lib/ollama";
import { getBloomLevelLabel, getStudentPresentation } from "@/lib/student-presentation";

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
  ]
    .filter(Boolean)
    .join(", ");
}

function parseGeneratedResponse(content: string) {
  const title = content.match(/TITLE:\s*(.+)/)?.[1]?.trim() ?? "AI-gegenereerde opdracht";
  const assignment = content.match(/ASSIGNMENT:\s*([\s\S]*?)RATIONALE:/)?.[1]?.trim() ?? content.trim();
  const rationale = content.match(/RATIONALE:\s*([\s\S]*?)SOURCES:/)?.[1]?.trim() ?? "";
  return { title, assignment, rationale };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, studentId, focusArea = "", bloomLevel = "" } = body ?? {};

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

  const presentation = getStudentPresentation(student.fullName);
  const resolvedBloom = bloomLevel || getBloomLevelLabel(student.bloomNiveau).replace("Ã«", "ë");
  const query = buildSearchQuery(focusArea, resolvedBloom, student.fullName);

  try {
    const searchResults = await executeSearchOpp(student.id, query, 3);
    const sources = parseSearchResults(searchResults);

    if (action === "search") {
      return NextResponse.json({ sources, query });
    }

    if (action !== "generate") {
      return NextResponse.json({ error: "Onbekende actie." }, { status: 400 });
    }

    const prompt = `Je bent Juf Aimee en genereert een gepersonaliseerde opdracht voor een hoogbegaafde leerling.

Geef exact dit formaat terug:
TITLE: <korte titel>
ASSIGNMENT:
<een concrete opdracht in verzorgd Nederlands, 5-8 zinnen, gericht aan de leerkracht>
RATIONALE:
<2-4 zinnen waarom deze opdracht past bij de leerling>
SOURCES:
<een korte bronregel per gebruikte bron>

Gebruik alleen de onderstaande context.

LEERLING
Naam: ${student.fullName}
Groep: ${student.profile?.currentSchoolYearGroup ?? student.groep ?? "onbekend"}
Bloom niveau: ${resolvedBloom}
Interesses: ${presentation.interests.join(", ")}
Leerstijl: ${presentation.learningStyle}
Werkmethode: ${presentation.workMethod}
Concentratie: ${presentation.concentration}
Sterktes: ${presentation.strengths.join(", ")}

RECENTE OPDRACHTEN
${student.assignments.map((assignment) => `- ${assignment.title} (${assignment.bloomLevel ?? "geen Bloom label"}, ${assignment.status})`).join("\n") || "- Geen recente opdrachten"}

OPP BRONNEN
${sources.join("\n\n") || "Geen OPP-bronnen gevonden."}

FOCUSGEBIED
${focusArea || "Kies een logisch focusgebied op basis van interesses en OPP."}`;

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
