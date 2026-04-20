import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { executeSearchOpp, searchOppTool, zoekBeginsituatie, zoekVolledigProfiel } from "@/app/ai/tools/search_opp";
import { GEN_MODEL, getEmbedding, ollama } from "@/lib/ollama";
import { getBloomLevelLabel, getStudentAge } from "@/lib/student-profile";
import { evalueerOpdracht } from "@/lib/judge";

type PrototypeAssignmentApiStudent  = {
  id: string;
  fullName: string;
  dateOfBirth?: Date | null;
  groep: string | null;
  bloomNiveau: number;
  profile: {
    currentSchoolYearGroup: string | null;
  } | null;
  assignments: Array<{
    title: string;
    status: string;
    bloomLevel: string | null;
    teacherFeedback: { content: string } | null;
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
  const assignmentMatch = content.match(/ASSIGNMENT:\s*([\s\S]*?)(?:STUDENT_TIP:|RATIONALE:)/i);
  const studentTipMatch = content.match(/STUDENT_TIP:\s*([\s\S]*?)RATIONALE:/i);
  const rationaleMatch = content.match(/RATIONALE:\s*([\s\S]*?)SOURCES:/i);

  const title = titleMatch?.[1]?.trim() ?? "AI-gegenereerde opdracht";
  const assignment = assignmentMatch?.[1]?.trim() ?? content.trim();
  const studentTip = studentTipMatch?.[1]?.trim() ?? "";
  const rationale = rationaleMatch?.[1]?.trim() ?? "";

  return { title, assignment, studentTip, rationale };
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
  estimatedTime: string;
  sources: string[];
  teacherPrompt?: string;
  currentAssignment?: {
    title?: string;
    assignment?: string;
    studentTip?: string;
    rationale?: string;
  } | null;
}) {
  const {
    student,
    schoolHistory,
    resolvedBloom,
    focusArea,
    estimatedTime,
    sources,
    teacherPrompt,
    currentAssignment,
  } = args;

  const presentation = deriveStudentPresentation({
    fullName: student.fullName,
    schoolHistory,
    assignments: student.assignments,
    oppTexts: sources,
  });

  const recentAssignments =
    student.assignments
      .map((a) => {
        const base = `- ${a.title} (Bloom: ${a.bloomLevel ?? "onbekend"}, status: ${a.status})`;
        return a.teacherFeedback?.content
          ? `${base}\n  [Feedback leraar]: "${a.teacherFeedback.content}"`
          : base;
      })
      .join("\n") || "- Geen recente opdrachten";

  const oppBronnen = sources.join("\n\n") || "Geen OPP-bronnen gevonden.";

  const huidigeProfiel = `Naam: ${student.fullName}
Groep: ${student.profile?.currentSchoolYearGroup ?? student.groep ?? "onbekend"}
Huidig Bloom-niveau: ${resolvedBloom}
Geschatte tijd voor de opdracht: ${estimatedTime}
Leeftijdsindicatie: basisschool hoogbegaafde leerling

Afgeleid leerlingprofiel (gebaseerd op OPP en opdrachtenhistorie):
- Interesses: ${presentation.interests.join(", ")}
- Leerstijl: ${presentation.learningStyle}
- Werkmethode: ${presentation.workMethod}
- Concentratieboog: ${presentation.concentration}
- Sterke punten: ${presentation.strengths.join(", ")}
- Didactische tips: ${presentation.smartTips.join(" | ")}`;

  const focusgebied = focusArea || presentation.interests[0] || "vrije verdieping";

  const huidigVersie = currentAssignment
    ? `Titel: ${currentAssignment.title ?? "onbekend"}
Opdracht:
${currentAssignment.assignment ?? ""}
Motivatie:
${currentAssignment.rationale ?? ""}`
    : "Er is nog geen eerdere versie.";

  const instructie = teacherPrompt?.trim() || "Maak de best passende eerste versie op basis van het leerlingprofiel.";

  return `Je bent Juf Aimee, een AI-assistent voor basisschoolleraren die gepersonaliseerde opdrachten genereert voor hoogbegaafde leerlingen.

Jouw taak: genereer één concrete, volledige opdracht die aansluit op het leerlingprofiel hieronder.

───────────────────────────────
LEERLINGPROFIEL
───────────────────────────────
${huidigeProfiel}

───────────────────────────────
RECENTE OPDRACHTEN
───────────────────────────────
${recentAssignments}

───────────────────────────────
OPP BRONNEN (relevante fragmenten uit het ontwikkelingsperspectief)
───────────────────────────────
${oppBronnen}

───────────────────────────────
FOCUSGEBIED VOOR DEZE OPDRACHT
───────────────────────────────
${focusgebied}

───────────────────────────────
INSTRUCTIE VAN DE LEERKRACHT
───────────────────────────────
${instructie}

───────────────────────────────
REGELS
───────────────────────────────
1. Sluit de opdracht aan op het Bloom-niveau "${resolvedBloom}" — gebruik de bijbehorende denkvaardigheden (zie hieronder).
2. Gebruik de interesses, leerstijl en werkmethode uit het leerlingprofiel als basis voor de opdrachtopbouw.
3. Als er OPP-bronnen zijn met "[LEERKRACHT FEEDBACK - afgekeurde opdracht]", vermijd dan expliciet die aanpak en kies een alternatief.
4. Schrijf de ASSIGNMENT direct aan de leerling, in de tweede persoon ("Jij gaat...", "Maak een...", "Beschrijf..."). Gebruik NOOIT "Laat de leerling..." of de naam van de leerling in de opdrachttekst.
5. De opdracht moet concreet en uitvoerbaar zijn: beschrijf wat de leerling doet en welk product er ontstaat. Begeleidingstips voor de leraar komen uitsluitend in TEACHER_NOTES.
6. Verzin geen kenmerken die niet in het profiel of de OPP-bronnen staan.
Pas de omvang, het aantal stappen en de diepgang van de opdracht aan op de geschatte tijd van ${estimatedTime}. Een opdracht van 15 minuten is kort en gericht; een weekopdracht heeft meerderefasen en een eindproduct. 

Bloom-niveau "${resolvedBloom}" betekent:
${resolvedBloom === "Onthouden" ? "- De leerling herhaalt, benoemt en reproduceert feiten en begrippen." : ""}${resolvedBloom === "Begrijpen" ? "- De leerling legt uit, omschrijft en interpreteert in eigen woorden." : ""}${resolvedBloom === "Toepassen" ? "- De leerling past kennis toe in een nieuwe situatie of bij een concreet probleem." : ""}${resolvedBloom === "Analyseren" ? "- De leerling ontleedt informatie, vergelijkt onderdelen en legt verbanden." : ""}${resolvedBloom === "Evalueren" ? "- De leerling beoordeelt, weegt argumenten af en onderbouwt een standpunt." : ""}${resolvedBloom === "Creëren" ? "- De leerling ontwerpt, maakt of stelt iets nieuws samen op basis van eigen inzichten." : ""}

───────────────────────────────
GEWENST UITVOERFORMAAT — volg dit exact
───────────────────────────────
TITLE: <korte, pakkende titel van de opdracht>
ASSIGNMENT:
<Volledige opdrachtbeschrijving, gericht aan de leraar. Beschrijf:
  • wat de leerling concreet gaat doen
  • welk product of resultaat er ontstaat
  • hoe dit aansluit op de interesses en leerstijl van de leerling
  • eventuele begeleidingstips voor de leraar>
STUDENT_TIP:
<Één korte, aanmoedigende tip van Juf Aimee direct aan de leerling. Max 2 zinnen. Gebruik de naam van de leerling niet. Schrijf warm en positief, passend bij het onderwerp van de opdracht.>
RATIONALE:
<2–4 zinnen die uitleggen waarom deze opdracht past bij de leerling. Benoem:
  • het Bloom-niveau en waarom de opdracht daar specifiek op aansluit
  • minimaal één kenmerk uit het leerlingprofiel of OPP (kort citeren: "Uit OPP: '...' blijkt dat...")
  • één onderwijskundige of psychologische bron (APA-stijl, varieer per opdracht) die de keuze onderbouwt>
SOURCES:
<Één bronregel per gebruikte informatiebron. Onderscheid:
  - OPP-fragment: korte omschrijving van het gebruikte fragment
  - Eerdere opdracht: titel en relevantie
  - Wetenschappelijke bron: volledige APA-verwijzing>`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    action,
    studentId,
    focusArea = "",
    bloomLevel = "",
    estimatedTime = "45 minuten",
    teacherPrompt = "",
    currentAssignment = null,
    assignmentId = null,
    feedback = "",
  } = body ?? {};

  if (!action) {
    return NextResponse.json({ error: "action is verplicht." }, { status: 400 });
  }

  // feedback action heeft geen studentId nodig — vroeg afhandelen
  if (action === "feedback") {
    if (!assignmentId || !feedback.trim()) {
      return NextResponse.json({ error: "assignmentId en feedback zijn verplicht." }, { status: 400 });
    }
    await prisma.teacherFeedback.upsert({
      where: { assignmentId },
      update: { content: feedback.trim() },
      create: { assignmentId, content: feedback.trim() },
    });
    return NextResponse.json({ ok: true });
  }

  if (!studentId) {
    return NextResponse.json({ error: "studentId is verplicht." }, { status: 400 });
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      profile: {
        select: {
          currentSchoolYearGroup: true,
          schoolHistory: true,
        },
      },
      assignments: {
        select: {
          title: true,
          status: true,
          bloomLevel: true,
          teacherFeedback: { select: { content: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Student niet gevonden." }, { status: 404 });
  }

  const resolvedBloom = normalizeBloomLabel(bloomLevel || getBloomLevelLabel(student.bloomNiveau));
  const query = buildSearchQuery(focusArea, resolvedBloom, student.fullName);

  try {
    const sources = await zoekVolledigProfiel(student.id, focusArea);

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
          studentTip: currentAssignment.studentTip ?? null,
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
    const inferredDateOfBirth = student.dateOfBirth ?? inferDateOfBirthFromSources(sources);

    if (!student.dateOfBirth && inferredDateOfBirth) {
      await prisma.student.update({
        where: { id: student.id },
        data: { dateOfBirth: inferredDateOfBirth },
      });
    }

    const leeftijd = getStudentAge(inferredDateOfBirth);
    const leeftijdLabel = leeftijd ? `${leeftijd} jaar` : "onbekend";
    const interestSnippets = extractProfileInterestsFromSources(sources);
    const interessesLabel =
      interestSnippets.length > 0
        ? interestSnippets.map((snippet) => `"${snippet}"`).join("; ")
        : "Niet expliciet benoemd in OPP-bronnen";
    const beginsituatieBronnen = await zoekBeginsituatie(student.id)
    const beginsituatie = beginsituatieBronnen.join("\n\n").slice(0, 800) 
  || "Geen OPP-informatie beschikbaar."


    const MAX_POGINGEN = 2;
    let poging = 0;
    let parsed: ReturnType<typeof parseGeneratedResponse> | null = null;
    const judgeResult: Awaited<ReturnType<typeof evalueerOpdracht>> | null = null;

    while (poging < MAX_POGINGEN) {
  poging++

    const prompt = buildGenerationPrompt({
      student,
      schoolHistory: student.profile?.schoolHistory,
      resolvedBloom,
      focusArea,
      sources,
      teacherPrompt,
      currentAssignment,
      estimatedTime,
    });

    console.log("\n========== LLM PROMPT ==========");
    console.log(prompt);
    console.log("=================================\n");

    const response = await ollama.chat({
      model: GEN_MODEL,
      messages: [{ role: "user", content: prompt }],
      options: { temperature: 0.3, num_predict: 900 },
    });

    const content = response.message.content?.trim() ?? "";

    console.log("\n========== LLM RESPONSE ==========");
    console.log(content);
    console.log("===================================\n");

    const parsed = parseGeneratedResponse(content);

    return NextResponse.json({
      sources,
      assignment: {
        ...parsed,
        sources,
      },
      judgeResult,
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
