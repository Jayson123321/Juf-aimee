import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { executeSearchOpp } from "@/app/ai/tools/search_opp";
import { GEN_MODEL, ollama } from "@/lib/ollama";
import { getBloomLevelLabel, getStudentPresentation } from "@/lib/student-presentation";

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
  return [focusArea || "onderwijsbehoeften", bloomLevel, `passende opdracht voor ${fullName}`]
    .filter(Boolean)
    .join(", ");
}

function parseGeneratedResponse(content: string) {
  const title = content.match(/TITLE:\s*(.+)/)?.[1]?.trim() ?? "AI-gegenereerde opdracht";
  const assignment =
    content.match(/ASSIGNMENT:\s*([\s\S]*?)RATIONALE:/)?.[1]?.trim() ?? content.trim();
  const rationale = content.match(/RATIONALE:\s*([\s\S]*?)SOURCES:/)?.[1]?.trim() ?? "";
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
  const presentation = getStudentPresentation(student.fullName);

  return `Je bent Juf Aimee en genereert een gepersonaliseerde opdracht voor een hoogbegaafde leerling.

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
    const searchResults = await executeSearchOpp(student.id, query, 3);
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
