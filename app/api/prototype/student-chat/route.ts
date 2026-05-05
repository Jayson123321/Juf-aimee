import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { executeSearchOpp } from "@/app/ai/tools/search_opp";
import { ASSISTANT_MODEL, ollama } from "@/lib/ollama";
import { deriveStudentPresentation, getBloomLevelLabel, getStudentAge } from "@/lib/student-profile";

type PersistedChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type ActiveAssignmentContext = {
  id: string;
  title: string;
  description: string;
  assignmentType: "TEXT" | "MULTIPLE_CHOICE";
  bloomLevel: string;
  studentTip: string;
  studentWork: string;
};

function fallbackWelcome(firstName: string) {
  return `Hoi ${firstName}! Ik ben Juf Aimee. Ik kijk met je mee en geef kleine hints. Waar wil je hulp bij?`;
}

function fallbackAnswer(firstName: string) {
  return `Ik denk graag met je mee, ${firstName}. Vertel me waar je vastloopt, dan geef ik je een kleine volgende stap zonder het antwoord weg te geven.`;
}

function mapMessages(
  messages: Array<{ role: "USER" | "ASSISTANT"; content: string }>,
): PersistedChatMessage[] {
  return messages.map((message) => ({
    role: message.role === "ASSISTANT" ? "assistant" : "user",
    content: message.content,
  }));
}

function truncateForPrompt(value: string | null | undefined, limit = 900) {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  return trimmed.length > limit ? `${trimmed.slice(0, limit)}…` : trimmed;
}

function buildAssignmentContextBlock(
  assignment: ActiveAssignmentContext | null,
  draftWork: string,
) {
  if (!assignment) {
    return "ACTIEVE OPDRACHT\nEr is op dit moment geen specifieke opdrachtcontext meegegeven.";
  }

  const currentWork = truncateForPrompt(draftWork || assignment.studentWork, 1200) || "Nog geen tekst of keuze meegestuurd.";

  return `ACTIEVE OPDRACHT
Titel: ${assignment.title}
Type: ${assignment.assignmentType === "MULTIPLE_CHOICE" ? "Meerkeuze" : "Open opdracht"}
Bloom-niveau: ${assignment.bloomLevel || "niet opgegeven"}
BELANGRIJK:
Behandel de opdrachttekst als schooloefening of denksituatie, de opdracht wordt gemaakt door een hoogbegaad kind van 6-11 jaar dus houd daar rekening mee. Ga er niet automatisch van uit dat alles letterlijk echt gebeurt in het leven van de leerling.
Opdrachttekst:
${truncateForPrompt(assignment.description, 1400) || "Geen extra opdrachttekst beschikbaar."}
Tip van Juf Aimee:
${truncateForPrompt(assignment.studentTip, 400) || "Geen extra tip beschikbaar."}

VOORTGANG VAN DE LEERLING
${currentWork}`;
}

function buildStudentChatPrompt({
  firstName,
  fullName,
  groupLabel,
  ageLabel,
  bloomLevel,
  presentation,
  assignmentsSummary,
  oppContext,
  assignmentContext,
  conversation,
  latestInstruction,
}: {
  firstName: string;
  fullName: string;
  groupLabel: string;
  ageLabel: string;
  bloomLevel: string;
  presentation: ReturnType<typeof deriveStudentPresentation>;
  assignmentsSummary: string;
  oppContext: string[];
  assignmentContext: string;
  conversation: string;
  latestInstruction: string;
}) {
  return `Je bent Juf Aimee, een warme AI-onderwijsassistent voor een kind van ongeveer 6 tot 11 jaar.

PRAATREGELS
- Praat direct tegen de leerling in eenvoudig, rustig en vriendelijk Nederlands.
- Houd antwoorden meestal kort: 2 tot 5 zinnen of een klein lijstje.
- Geef hints, tussenstappen, verduidelijkingen en denkvragen.
- Geef NIET het volledige antwoord, NIET de juiste meerkeuzeletter en NIET een kant-en-klaar antwoord dat de leerling alleen hoeft over te typen.
- Als de leerling om het antwoord vraagt, geef je één kleinere hint of stel je een wedervraag.
- Sluit aan op wat de leerling al heeft getypt of gekozen.
- Gebruik het profiel en de OPP-context alleen om beter te helpen; verzin geen nieuwe feiten.
- Als de leerling onzeker of gefrustreerd klinkt, benoem dat kort en help daarna weer verder.
- Behandel opdrachtteksten als schoolsituaties of oefenvragen, niet automatisch als letterlijke gebeurtenissen uit het echte leven van het kind.
- Als de opdracht een meerkeuzevraag is: help met denkstrategie, sleutelwoorden en opties vergelijken, zonder de juiste optie weg te geven.
- Als de opdracht een open vraag is: help met een eerste stap, een plan of een voorbeeld van hoe je kunt beginnen, zonder het antwoord over te nemen.
- Zeg dus niet dingen als "jij hebt een nieuwe computer gekregen" als dat alleen in de vraagtekst staat. Zeg liever: "in deze vraag", "in het voorbeeld" of "bij deze opdracht".

LEERLING
Naam: ${fullName}
Leeftijd: ${ageLabel}
Groep: ${groupLabel}
Bloom-niveau: ${bloomLevel}
Interesses: ${presentation.interests.join(", ")}
Leerstijl: ${presentation.learningStyle}
Werkmethode: ${presentation.workMethod}
Concentratie: ${presentation.concentration}
Sterktes: ${presentation.strengths.join(", ")}
Slimme begeleidtips: ${presentation.smartTips.join(" | ")}

RECENTE OPDRACHTEN
${assignmentsSummary}

OPP CONTEXT
${oppContext.join("\n") || "Geen extra OPP-context gevonden."}

${assignmentContext}

GESPREK TOT NU TOE
${conversation || "Nog geen eerdere berichten."}

LAATSTE HULPVRAAG
${latestInstruction}

Geef nu een behulpzaam, kindvriendelijk antwoord als Juf Aimee aan ${firstName}.`;
}

async function getOrCreateSession(studentId: string) {
  const existing = await prisma.studentChatSession.findUnique({
    where: { studentId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (existing) return existing;

  return prisma.studentChatSession.create({
    data: { studentId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    action,
    studentId,
    message = "",
    assignmentId,
    assignmentTitle,
    assignmentDescription,
    assignmentType,
    assignmentTip,
    assignmentQuestion,
    draftWork = "",
    conversation = [],
  } = body ?? {};

  if (!action || !studentId) {
    return NextResponse.json(
      { error: "action en studentId zijn verplicht." },
      { status: 400 },
    );
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      profile: true,
      oppChunks: {
        select: {
          tekst: true,
        },
        take: 12,
      },
      assignments: {
        select: {
          title: true,
          description: true,
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

  const session = await getOrCreateSession(student.id);
  const firstName = student.fullName.split(" ")[0];
  const studentAge = getStudentAge(student.dateOfBirth);
  const ageLabel = studentAge ? `${studentAge} jaar` : "basisschoolleeftijd";
  const groupLabel = student.profile?.currentSchoolYearGroup ?? student.groep ?? "onbekend";
  const bloomLevel = getBloomLevelLabel(student.bloomNiveau)
    .replace("ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â«", "ÃƒÂ«")
    .replace("ÃƒÆ’Ã‚Â«", "ÃƒÂ«");

  const activeAssignmentRecord = assignmentId
    ? await prisma.assignment.findFirst({
        where: { id: assignmentId, studentId: student.id },
        select: {
          id: true,
          title: true,
          description: true,
          assignmentType: true,
          bloomLevel: true,
          studentTip: true,
          studentWork: true,
        },
      })
    : null;

  const resolvedAssignment: ActiveAssignmentContext | null =
    activeAssignmentRecord || assignmentTitle || assignmentDescription || assignmentQuestion
      ? {
          id: activeAssignmentRecord?.id ?? assignmentId ?? "unsaved-assignment",
          title: activeAssignmentRecord?.title ?? assignmentTitle ?? "Huidige opdracht",
          description:
            activeAssignmentRecord?.assignmentType === "MULTIPLE_CHOICE"
              ? assignmentQuestion ||
                activeAssignmentRecord?.description ||
                assignmentDescription ||
                "Meerkeuzevraag"
              : activeAssignmentRecord?.description || assignmentDescription || assignmentQuestion || "",
          assignmentType:
            activeAssignmentRecord?.assignmentType ??
            (assignmentType === "MULTIPLE_CHOICE" ? "MULTIPLE_CHOICE" : "TEXT"),
          bloomLevel: activeAssignmentRecord?.bloomLevel ?? bloomLevel,
          studentTip: activeAssignmentRecord?.studentTip ?? assignmentTip ?? "",
          studentWork: activeAssignmentRecord?.studentWork ?? "",
        }
      : null;
  const assignmentScoped = Boolean(assignmentId);

  try {
    if (action === "init") {
      if (!assignmentScoped && session.messages.length > 0) {
        return NextResponse.json({ messages: mapMessages(session.messages) });
      }

      const oppContext = await executeSearchOpp(
        student.id,
        `${student.fullName}, interesses, leerstijl, begeleiding leerlingchat`,
        3,
      );
      const presentation = deriveStudentPresentation({
        fullName: student.fullName,
        schoolHistory: student.profile?.schoolHistory,
        assignments: student.assignments,
        oppTexts: [...student.oppChunks.map((chunk) => chunk.tekst), ...oppContext],
      });
      const assignmentsSummary =
        student.assignments
          .map(
            (assignment) =>
              `- ${assignment.title} (${assignment.bloomLevel ?? "geen Bloom label"}, ${assignment.status})`,
          )
          .join("\n") || "- Geen opdrachten gevonden";
      const assignmentContext = buildAssignmentContextBlock(
        resolvedAssignment,
        String(draftWork ?? ""),
      );

      const response = await ollama.chat({
        model: ASSISTANT_MODEL,
        messages: [
          {
            role: "user",
            content: buildStudentChatPrompt({
              firstName,
              fullName: student.fullName,
              groupLabel,
              ageLabel,
              bloomLevel,
              presentation,
              assignmentsSummary,
              oppContext,
              assignmentContext,
              conversation: "",
              latestInstruction: `Geef een eerste korte begroeting aan ${firstName} en laat merken dat je kunt helpen met de huidige opdracht zonder het antwoord te verklappen.`,
            }),
          },
        ],
        options: { temperature: 0.25, num_predict: 140 },
      });

      const welcomeMessage = response.message.content?.trim() || fallbackWelcome(firstName);

      if (assignmentScoped) {
        return NextResponse.json({
          messages: [{ role: "assistant", content: welcomeMessage }],
        });
      }

      const updatedSession = await prisma.studentChatSession.update({
        where: { id: session.id },
        data: {
          messages: {
            create: {
              role: "ASSISTANT",
              content: welcomeMessage,
            },
          },
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      return NextResponse.json({ messages: mapMessages(updatedSession.messages) });
    }

    if (action !== "message") {
      return NextResponse.json({ error: "Onbekende actie." }, { status: 400 });
    }

    if (!String(message).trim()) {
      return NextResponse.json({ error: "Bericht is leeg." }, { status: 400 });
    }

    if (!assignmentScoped) {
      await prisma.studentChatMessage.create({
        data: {
          sessionId: session.id,
          role: "USER",
          content: String(message).trim(),
        },
      });
    }

    const latestSession = assignmentScoped
      ? null
      : await prisma.studentChatSession.findUnique({
          where: { id: session.id },
          include: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: 8,
            },
          },
        });

    const oppContext = await executeSearchOpp(
      student.id,
      `${message}, ${student.fullName}, leerlingchat hulpvraag, ${resolvedAssignment?.title ?? ""}`,
      3,
    );
    const presentation = deriveStudentPresentation({
      fullName: student.fullName,
      schoolHistory: student.profile?.schoolHistory,
      assignments: student.assignments,
      oppTexts: [...student.oppChunks.map((chunk) => chunk.tekst), ...oppContext],
    });
    const assignmentsSummary =
      student.assignments
        .map(
          (assignment) =>
            `- ${assignment.title} (${assignment.bloomLevel ?? "geen Bloom label"}, ${assignment.status})`,
        )
        .join("\n") || "- Geen opdrachten gevonden";
    const assignmentContext = buildAssignmentContextBlock(
      resolvedAssignment,
      String(draftWork ?? ""),
    );
    const conversationMessages = assignmentScoped
      ? (Array.isArray(conversation) ? conversation : [])
      : [...(latestSession?.messages ?? [])].reverse().map((item) => ({
          role: item.role === "ASSISTANT" ? "assistant" : "user",
          content: item.content,
        }));

    const response = await ollama.chat({
      model: ASSISTANT_MODEL,
      messages: [
        {
          role: "user",
          content: buildStudentChatPrompt({
            firstName,
            fullName: student.fullName,
            groupLabel,
            ageLabel,
            bloomLevel,
            presentation,
            assignmentsSummary,
            oppContext,
            assignmentContext,
            conversation:
              conversationMessages
                .map((item) => `${item.role === "user" ? "Leerling" : "Juf Aimee"}: ${item.content}`)
                .join("\n") || "Nog geen eerdere berichten.",
            latestInstruction: String(message).trim(),
          }),
        },
      ],
      options: { temperature: 0.3, num_predict: 220 },
    });

    const assistantMessage = response.message.content?.trim() || fallbackAnswer(firstName);

    if (!assignmentScoped) {
      await prisma.studentChatMessage.create({
        data: {
          sessionId: session.id,
          role: "ASSISTANT",
          content: assistantMessage,
        },
      });
    }

    return NextResponse.json({
      message: assistantMessage,
    });
  } catch {
    if (action === "init") {
      if (session.messages.length > 0) {
        return NextResponse.json({ messages: mapMessages(session.messages) });
      }

      const welcomeMessage = fallbackWelcome(firstName);

      const updatedSession = await prisma.studentChatSession.update({
        where: { id: session.id },
        data: {
          messages: {
            create: {
              role: "ASSISTANT",
              content: welcomeMessage,
            },
          },
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      return NextResponse.json({ messages: mapMessages(updatedSession.messages) });
    }

    const assistantMessage = fallbackAnswer(firstName);

    await prisma.studentChatMessage.create({
      data: {
        sessionId: session.id,
        role: "ASSISTANT",
        content: assistantMessage,
      },
    });

    return NextResponse.json({ message: assistantMessage });
  }
}
