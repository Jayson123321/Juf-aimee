import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { executeSearchOpp } from "@/app/ai/tools/search_opp";
import { GEN_MODEL, ollama } from "@/lib/ollama";
import { deriveStudentPresentation, getBloomLevelLabel } from "@/lib/student-profile";

type PersistedChatMessage = {
  role: "assistant" | "user";
  content: string;
};

function fallbackWelcome(firstName: string) {
  return `Hoi ${firstName}! Ik ben Juf Aimee. Ik heb net even gekeken naar jouw profiel, interesses en opdrachten. Waar wil je graag hulp bij?`;
}

function fallbackAnswer(firstName: string) {
  return `Ik denk graag met je mee, ${firstName}. Vertel me waar je vastloopt of wat je wilt begrijpen, dan help ik je stap voor stap verder.`;
}

function mapMessages(
  messages: Array<{ role: "USER" | "ASSISTANT"; content: string }>,
): PersistedChatMessage[] {
  return messages.map((message) => ({
    role: message.role === "ASSISTANT" ? "assistant" : "user",
    content: message.content,
  }));
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
  const { action, studentId, message = "" } = body ?? {};

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
  const bloomLevel = getBloomLevelLabel(student.bloomNiveau)
    .replace("ÃƒÆ’Ã‚Â«", "Ã«")
    .replace("ÃƒÂ«", "Ã«");

  try {
    if (action === "init") {
      if (session.messages.length > 0) {
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
        oppTexts: [...student.oppChunks.map((chunk) => chunk.tekst), oppContext],
      });

      const response = await ollama.chat({
        model: GEN_MODEL,
        messages: [
          {
            role: "user",
            content: `Je bent Juf Aimee, een vriendelijke AI-onderwijsassistent voor een leerling in het basisonderwijs.

Praat direct tegen de leerling in warm, eenvoudig Nederlands.
Houd je antwoord kort en geruststellend.
Laat merken dat je eerst profiel, opdrachten en OPP-context hebt bekeken.

LEERLING
Naam: ${student.fullName}
Groep: ${student.profile?.currentSchoolYearGroup ?? student.groep ?? "onbekend"}
Bloom niveau: ${bloomLevel}
Interesses: ${presentation.interests.join(", ")}
Leerstijl: ${presentation.learningStyle}
Werkmethode: ${presentation.workMethod}

RECENTE OPDRACHTEN
${student.assignments
                .map(
                  (assignment) =>
                    `- ${assignment.title} (${assignment.bloomLevel ?? "geen Bloom label"}, ${assignment.status})`,
                )
                .join("\n") || "- Geen opdrachten gevonden"}

OPP CONTEXT
${oppContext}

Geef een eerste korte begroeting aan ${firstName}.
Sluit af met een open vraag waar je mee kunt helpen.`,
          },
        ],
        options: { temperature: 0.25, num_predict: 140 },
      });

      const welcomeMessage = response.message.content?.trim() || fallbackWelcome(firstName);

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

    await prisma.studentChatMessage.create({
      data: {
        sessionId: session.id,
        role: "USER",
        content: String(message).trim(),
      },
    });

    const latestSession = await prisma.studentChatSession.findUnique({
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
      `${message}, ${student.fullName}, leerlingchat hulpvraag`,
      3,
    );
    const presentation = deriveStudentPresentation({
      fullName: student.fullName,
      schoolHistory: student.profile?.schoolHistory,
      assignments: student.assignments,
      oppTexts: [...student.oppChunks.map((chunk) => chunk.tekst), oppContext],
    });

    const conversation = [...(latestSession?.messages ?? [])].reverse();

    const response = await ollama.chat({
      model: GEN_MODEL,
      messages: [
        {
          role: "user",
          content: `Je bent Juf Aimee, een vriendelijke AI-onderwijsassistent voor een leerling in het basisonderwijs.

Praat direct tegen de leerling in warm, eenvoudig Nederlands.
Blijf concreet en kort: meestal 3 tot 6 zinnen.
Wees behulpzaam, rustig en positief.
Geef hints, uitleg en denkstappen.
Geef niet automatisch het volledige eindantwoord.

LEERLING
Naam: ${student.fullName}
Groep: ${student.profile?.currentSchoolYearGroup ?? student.groep ?? "onbekend"}
Bloom niveau: ${bloomLevel}
Interesses: ${presentation.interests.join(", ")}
Leerstijl: ${presentation.learningStyle}
Werkmethode: ${presentation.workMethod}
Sterktes: ${presentation.strengths.join(", ")}

RECENTE OPDRACHTEN
${student.assignments
              .map(
                (assignment) =>
                  `- ${assignment.title} (${assignment.bloomLevel ?? "geen Bloom label"}, ${assignment.status})`,
              )
              .join("\n") || "- Geen opdrachten gevonden"}

OPP CONTEXT
${oppContext}

GESPREK TOT NU TOE
${conversation
              .map((item) => `${item.role === "USER" ? "Leerling" : "Juf Aimee"}: ${item.content}`)
              .join("\n") || "Nog geen eerdere berichten."}

Geef nu een behulpzaam antwoord als Juf Aimee op het laatste bericht van de leerling.`,
        },
      ],
      options: { temperature: 0.3, num_predict: 220 },
    });

    const assistantMessage = response.message.content?.trim() || fallbackAnswer(firstName);

    await prisma.studentChatMessage.create({
      data: {
        sessionId: session.id,
        role: "ASSISTANT",
        content: assistantMessage,
      },
    });

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
