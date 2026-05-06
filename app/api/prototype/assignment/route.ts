// Verplaatst naar /api/assign — deze re-export houdt bestaande callers werkend.
export { POST } from "@/app/api/assign/route";
/* OLD IMPLEMENTATION BELOW — kept for reference, not active

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { executeSearchOpp, searchOppTool, zoekBeginsituatie, zoekVolledigProfiel } from "@/app/ai/tools/search_opp";
import { GEN_MODEL, getEmbedding, ollama } from "@/lib/ollama";
import { getBloomLevelLabel, getStudentAge } from "@/lib/student-profile";
import { evalueerOpdrachtStreaming } from "@/lib/judge";
import { retrieveLeerlinggeschiedenis, formatLeerlinggeschiedenis } from "@/lib/ras/retrieveLeerlinggeschiedenis";
import { analyzePortfolio, type PortfolioInsights } from "@/lib/portfolio-analysis";

type PrototypeAssignmentApiStudent = {
  id: string;
  fullName: string;
  dateOfBirth?: Date | null;
  groep: string | null;
  bloomNiveau: number | null;
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
  const assignmentMatch = content.match(/ASSIGN(?:MENT|ATION):\s*([\s\S]*?)RATIONALE:/i);
  const rationaleMatch = content.match(/RATIONALE:\s*([\s\S]*?)SOURCES:/i);

  const title = titleMatch?.[1]?.trim() ?? "AI-gegenereerde opdracht";
  const assignment = assignmentMatch?.[1]?.trim() ?? content.trim();
  const rationale = rationaleMatch?.[1]?.trim() ?? "";

  return { title, assignment, rationale };
}

function inferDateOfBirthFromSources(sources: string[]): Date | null {
  for (const source of sources) {
    const lower = source.toLowerCase();
    const hasBirthLabel = lower.includes("geboortedatum");
    if (!hasBirthLabel) continue;

    const match = source.match(/(\d{1,2})[\-/.](\d{1,2})[\-/.](\d{4})/);
    if (!match) continue;

    const day = Number.parseInt(match[1], 10);
    const month = Number.parseInt(match[2], 10);
    const year = Number.parseInt(match[3], 10);

    if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
      continue;
    }

    if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
      continue;
    }

    const candidate = new Date(year, month - 1, day);
    if (
      candidate.getFullYear() === year &&
      candidate.getMonth() === month - 1 &&
      candidate.getDate() === day
    ) {
      return candidate;
    }
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
      const matches = source.match(pattern) ?? [];
      for (const raw of matches) {
        const cleaned = raw.replace(/\s+/g, " ").trim();
        if (cleaned.length >= 12) snippets.add(cleaned);
      }
    }
  }

  return [...snippets].slice(0, 3);
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

type RejectedAssignment = {
  title: string;
  reason: string;
};

// function buildGenerationPrompt(args: {
//   student: PrototypeAssignmentApiStudent;
//   resolvedBloom: string;
//   focusVak?: string;
//   focusArea: string;
//   estimatedTime?: string;
//   sources: string[];
//   schoolHistory?: string | null;
//   teacherPrompt?: string;
//   currentAssignment?: {
//     title?: string;
//     assignment?: string;
//     rationale?: string;
//   } | null;
//   rejectedAssignments?: RejectedAssignment[];
// }) {
//   const {
//     student, schoolHistory, resolvedBloom, focusVak, focusArea,
//     estimatedTime = "45 minuten", sources, teacherPrompt, currentAssignment, rejectedAssignments,
//   } = args;
//   const presentation = deriveStudentPresentation({ fullName: student.fullName, schoolHistory, assignments: student.assignments, oppTexts: sources });
//   const recentAssignments = student.assignments.map((a) => { const base = `- ${a.title} (Bloom: ${a.bloomLevel ?? "onbekend"}, status: ${a.status})`; return a.teacherFeedback?.content ? `${base}\n  [Feedback leraar]: "${a.teacherFeedback.content}"` : base; }).join("\n") || "- Geen recente opdrachten";
//   const oppBronnen = sources.join("\n\n") || "Geen OPP-bronnen gevonden.";
//   const focusgebied = focusArea || presentation.interests[0] || "vrije verdieping";
//   const instructie = teacherPrompt?.trim() || "Maak de best passende eerste versie op basis van het leerlingprofiel.";
//   const huidigVersie = currentAssignment ? `Titel: ${currentAssignment.title ?? "onbekend"}\nOpdracht:\n${currentAssignment.assignment ?? ""}\nMotivatie:\n${currentAssignment.rationale ?? ""}` : "Er is nog geen eerdere versie.";
//   return `[NIEUWE PROMPT MET LEERLINGPROFIEL - zie git history]`;
// }

// ─── ACTIEVE PROMPT (oud) ────────────────────────────────────────────────────
function buildGenerationPrompt(args: {
  student: PrototypeAssignmentApiStudent;
  resolvedBloom: string;
  focusArea: string;
  teacherPrompt?: string;
  currentAssignment?: {
    title?: string;
    assignment?: string;
    rationale?: string;
  } | null;
  rejectedAssignments?: RejectedAssignment[];
  geschiedenis?: string;
  portfolioInsights: PortfolioInsights;
}) {
  const { student, resolvedBloom, focusArea, teacherPrompt, currentAssignment, rejectedAssignments, geschiedenis, portfolioInsights } = args;

  const portfolioAnalyseSection = portfolioInsights.portfolioSummary
    ? `${portfolioInsights.portfolioSummary}${
        portfolioInsights.suggestedNextBloom
          ? `\nAanbevolen Bloom-niveau voor nieuwe opdracht: ${portfolioInsights.suggestedNextBloom}`
          : ""
      }`
    : "Geen eerdere opdrachten beschikbaar.";

  return `Je bent Juf Aimee: een deskundige in hoogbegaafdheidsonderwijs op de basisschool.

Je taak is een gepersonaliseerde verrijkingsopdracht maken voor een hoogbegaafde leerling.
Gebruik eenvoudig, helder Nederlands zonder abstracte begrippen.

STAP 1 — Gebruik de search_opp tool om het volgende op te halen:
- Zoek naar interesses en passies van de leerling (dit zijn de ENIGE interesses die je mag gebruiken)
- Zoek naar afgekeurde opdrachten en leerkrachtfeedback — deze onderwerpen en formats zijn VERBODEN
- Zoek naar beginsituatie, leerniveau en werkhouding
- Zoek naar zwakke vakgebieden van de leerling

STAP 2 — Maak de opdracht op basis van wat je hebt gevonden.

INSTRUCTIE VAN DE LEERKRACHT (hoogste prioriteit — volg dit exact op)
${teacherPrompt || "Maak de best passende eerste versie op basis van het vak en Bloom-niveau."}

HARDE EISEN:
1. De opdracht gaat over het schoolvak: ${focusArea || "een schoolvak naar keuze"}
2. De opdracht past bij Bloom-niveau: ${resolvedBloom}
3. Volg de leerkrachtinstructie hierboven — dat bepaalt het onderwerp en de werkvorm
4. Als de leerkracht een tekenoverdracht vraagt maak ALTIJD een tekenoverdracht
   - Beschrijf concreet WAT de leerling moet tekenen (bijv. een gebouw, landschap, fantasiekarakters, plattegrond)
   - Beschrijf HOE: welke materialen, welke stijl, welk formaat, welke kleuren
   - Beschrijf het eindresultaat: wat moet erop staan, welke elementen zijn verplicht
5. Als de leerling zwak is in schrijven/taal: maak GEEN schrijfopdracht tenzij het vak dit vereist
6. Afgekeurde opdrachten: genereer NOOIT een opdracht die lijkt op eerder afgekeurde opdrachten
7. De opdracht is concreet en direct uitvoerbaar
8. De opdracht bevat altijd een cognitieve uitdaging die past bij hoogbegaafdheid:
   - Een redeneer- of analysevraag (bijv. "waarom", "wat als", "vergelijk")
   - Of een creatieve keuze die de leerling moet verantwoorden
   - Of een verband leggen tussen het onderwerp en de echte wereld
9. Vermijd opdrachten die alleen uitvoerend zijn (knippen, natekenen, invullen) — er moet altijd een denkstap in zitten

LEERLING
Naam: ${student.fullName}
Student ID: ${student.id}
Groep: ${student.profile?.currentSchoolYearGroup ?? student.groep ?? "onbekend"}
Bloom niveau: ${resolvedBloom}

HUIDIGE VERSIE (ter referentie — schrijf altijd een volledig nieuwe versie, kopieer nooit de bestaande tekst)
${currentAssignment
  ? `Titel: ${currentAssignment.title ?? "onbekend"}\nOpdracht:\n${currentAssignment.assignment ?? ""}`
  : "Er is nog geen eerdere versie."}

BELANGRIJK: De huidige versie kan meta-instructies bevatten zoals "Voeg X toe" of "Herschrijf Y". Negeer deze volledig — schrijf de opdracht opnieuw als een vloeiende, natuurlijke tekst gericht aan de leerling.

LEERLINGGESCHIEDENIS (gebruik dit om de nieuwe opdracht beter te laten aansluiten op wat de leerling eerder heeft gedaan)
${geschiedenis ?? "Geen eerdere opdrachten beschikbaar."}

PORTFOLIO ANALYSE (gebruik dit om rekening te houden met de ontwikkeling van de leerling)
${portfolioAnalyseSection}

VERBODEN ONDERWERPEN EN FORMATS (uit afgekeurde opdrachten)
${rejectedAssignments?.length
  ? rejectedAssignments.map((r: RejectedAssignment) => `- "${r.title}": ${r.reason}`).join("\n")
  : "Geen afgekeurde opdrachten bekend."}

Geef exact dit formaat terug:
TITLE: <korte titel>
ASSIGNMENT:
<concrete opdracht in verzorgd Nederlands, 5-8 zinnen>
RATIONALE:
<2-4 zinnen waarom deze opdracht past bij de leerkrachtinstructie en het Bloom-niveau>
SOURCES:
<bronnen die je hebt gebruikt>`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    action,
    studentId,
    focusArea = "",
    bloomLevel = "",
    teacherPrompt = "",
    // estimatedTime = "45 minuten", // niet gebruikt door actieve prompt
    currentAssignment = null,
  } = body ?? {};

  if (!studentId || !action) {
    return NextResponse.json({ error: "studentId en action zijn verplicht." }, { status: 400 });
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
        where: { status: "COMPLETED" },
        select: {
          title: true,
          status: true,
          bloomLevel: true,
          teacherFeedback: { select: { content: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      },
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Student niet gevonden." }, { status: 404 });
  }

  const portfolioInsights = analyzePortfolio(student.assignments);

  const resolvedBloom = normalizeBloomLabel(bloomLevel || getBloomLevelLabel(student.bloomNiveau));
  const query = buildSearchQuery(focusArea, resolvedBloom, student.fullName);

  try {
    const sources = await zoekVolledigProfiel(student.id, focusArea);

    if (action === "search") {
      return NextResponse.json({
        sources,
        query,
        suggestedNextBloom: portfolioInsights.suggestedNextBloom,
      });
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

    if (action === "feedback") {
      const { assignmentId, feedback } = body ?? {};

      if (!feedback?.trim()) {
        return NextResponse.json({ error: "Feedback is verplicht." }, { status: 400 });
      }

      // Opslaan in TeacherFeedback voor de RAS-1flow (leerlinggeschiedenis)
      if (assignmentId) {
        await prisma.teacherFeedback.upsert({
          where: { assignmentId },
          create: { assignmentId, content: feedback.trim() },
          update: { content: feedback.trim() },
        });
      }

      // Opslaan in OppChunk voor de RAG vector search
      const feedbackText = "[LEERKRACHT FEEDBACK - goedgekeurde opdracht]\nOpdracht ID: \"" + (assignmentId ?? "onbekend") + "\"\nFeedback: \"" + feedback.trim() + "\"";

      try {
        const embedding = await getEmbedding(feedbackText);
        const vectorStr = "[" + embedding.join(",") + "]";
        await prisma.$executeRawUnsafe(
          `INSERT INTO "OppChunk" ("studentId", "tekst", "embedding") VALUES ($1, $2, $3::vector)`,
          student.id, feedbackText, vectorStr,
        );
      } catch {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "OppChunk" ("studentId", "tekst") VALUES ($1, $2)`,
          student.id, feedbackText,
        );
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

    const geschiedenisItems = await retrieveLeerlinggeschiedenis(student.id)
    const geschiedenis = formatLeerlinggeschiedenis(geschiedenisItems)

    const rejectedChunks = await prisma.oppChunk.findMany({
      where: {
        studentId: student.id,
        tekst: { contains: "[LEERKRACHT FEEDBACK - afgekeurde opdracht]" },
      },
      select: { tekst: true },
    });

    const rejectedAssignments: RejectedAssignment[] = rejectedChunks.map(({ tekst }) => {
      const titleMatch = tekst.match(/Opdrachttitel:\s*"([^"]+)"/);
      const reasonMatch = tekst.match(/Reden van afkeuring:\s*"([^"]+)"/);
      return {
        title: titleMatch?.[1] ?? "onbekend",
        reason: reasonMatch?.[1] ?? tekst,
      };
    });

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        function send(event: Record<string, unknown>) {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"))
        }

        try {
          send({ type: "sources", data: sources })

          const MAX_POGINGEN = 2
          let poging = 0
          let parsed: ReturnType<typeof parseGeneratedResponse> | null = null
          let judgeResult: Awaited<ReturnType<typeof evalueerOpdrachtStreaming>> | null = null

          while (poging < MAX_POGINGEN) {
            poging++

            const prompt = buildGenerationPrompt({
              student,
              resolvedBloom,
              focusArea,
              teacherPrompt,
              currentAssignment,
              rejectedAssignments,
              geschiedenis,
              portfolioInsights,
            })

            // Eerste aanroep met tool
            const firstResponse = await ollama.chat({
              model: GEN_MODEL,
              messages: [{ role: "user", content: prompt }],
              tools: [searchOppTool],
              options: { temperature: 0.3 },
            })

            const assistantContent =
              typeof firstResponse.message.content === "string"
                ? firstResponse.message.content
                : JSON.stringify(firstResponse.message.content ?? "")

            const messages: { role: string; content: string }[] = [
              { role: "user", content: prompt },
              { role: "assistant", content: assistantContent },
            ]

            // Tool calls verwerken
            if (firstResponse.message.tool_calls) {
              for (const toolCall of firstResponse.message.tool_calls) {
                const { student_id, query } = toolCall.function.arguments
                const toolResult = await executeSearchOpp(student_id, query, 3)
                messages.push({
                  role: "tool",
                  content: typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult),
                })
              }
            }

            // Tweede aanroep zonder tools
            const finalResponse = await ollama.chat({
              model: GEN_MODEL,
              messages,
              options: { temperature: 0.3, num_predict: 500 },
            })

            const content = finalResponse.message.content?.trim() ?? ""
            parsed = parseGeneratedResponse(content)

            send({
              type: "assignment",
              data: { ...parsed, sources },
            })

            // Judge — elk criterium wordt live gestreamd
            send({ type: "judge_start", data: { total: 8 } })

            try {
              judgeResult = await evalueerOpdrachtStreaming(
                {
                  naam: student.fullName,
                  leeftijd: leeftijdLabel,
                  interesses: interessesLabel,
                  bloomNiveau: resolvedBloom,
                  vak: focusArea || "Algemeen",
                  beginsituatie,
                  gegenereerdeOpdracht: parsed.assignment,
                  volledigOpp: sources.join("\n\n---\n\n"),
                },
                (step) => send({ type: "judge_step", data: step }),
                poging,
              )

              send({ type: "judge_done", data: judgeResult })
            } catch {
              break
            }

            if (judgeResult.beslissing !== "opnieuw_genereren") break
          }

          controller.close()
        } catch (error) {
          send({
            type: "error",
            data: {
              message:
                error instanceof Error
                  ? error.message
                  : "Opdracht genereren mislukt.",
            },
          })
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    })
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
*/
