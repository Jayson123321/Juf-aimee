import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { executeSearchOpp } from "@/app/ai/tools/search_opp";
import { GEN_MODEL, ollama } from "@/lib/ollama";
import { deriveStudentPresentation } from "@/lib/student-profile";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

function parseTipLines(content: string) {
  return content
    .split("\n")
    .map((line) => line.replace(/^[\-\d\.\)\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 4);
}

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";

  // --- File upload ---
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const studentId = formData.get("studentId") as string | null;
    const assignmentId = formData.get("assignmentId") as string | null;
    const file = formData.get("file") as File | null;

    if (!studentId || !assignmentId || !file) {
      return NextResponse.json({ error: "studentId, assignmentId en file zijn verplicht." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Bestandstype niet toegestaan. Gebruik PDF, Word of een afbeelding." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Bestand is te groot. Maximum is 10 MB." }, { status: 400 });
    }

    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, studentId },
    });
    if (!assignment) {
      return NextResponse.json({ error: "Opdracht niet gevonden." }, { status: 404 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "assignments", assignmentId);
    await mkdir(uploadDir, { recursive: true });

    const safeFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const filePath = path.join(uploadDir, safeFileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/assignments/${assignmentId}/${safeFileName}`;

    const submission = await prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        fileName: file.name,
        filePath: fileUrl,
        mimeType: file.type,
        fileSize: file.size,
      },
    });

    return NextResponse.json({ ok: true, submission });
  }

  const body = await req.json();
  const { action, studentId, assignmentId, work = "" } = body ?? {};

  if (!action || !studentId || !assignmentId) {
    return NextResponse.json(
      { error: "action, studentId en assignmentId zijn verplicht." },
      { status: 400 },
    );
  }

  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      studentId,
    },
    include: {
      student: {
        include: {
          profile: true,
          oppChunks: {
            select: {
              tekst: true,
            },
            take: 12,
          },
        },
      },
    },
  });

  if (!assignment) {
    return NextResponse.json({ error: "Opdracht niet gevonden." }, { status: 404 });
  }

  if (action === "save") {
    const updated = await prisma.assignment.update({
      where: { id: assignment.id },
      data: {
        studentWork: work,
        savedAt: new Date(),
        status: work.trim() ? "IN_PROGRESS" : assignment.status,
      },
      select: {
        id: true,
        status: true,
        savedAt: true,
      },
    });

    return NextResponse.json({ ok: true, assignment: updated });
  }

  if (action === "submit") {
    // Gebruik meegegeven werk, of val terug op al opgeslagen werk
    const workToSubmit = work.trim() || assignment.studentWork?.trim() || "";

    if (!workToSubmit) {
      return NextResponse.json(
        { error: "Je moet eerst een antwoord schrijven voordat je kunt inleveren." },
        { status: 400 },
      );
    }

    const updated = await prisma.assignment.update({
      where: { id: assignment.id },
      data: {
        studentWork: workToSubmit,
        savedAt: new Date(),
        submittedAt: new Date(),
        status: "COMPLETED",
      },
      select: {
        id: true,
        status: true,
        submittedAt: true,
      },
    });

    return NextResponse.json({ ok: true, assignment: updated });
  }

  if (action === "tips") {
    try {
      const oppResults = await executeSearchOpp(
        studentId,
        `${assignment.title}, ${assignment.bloomLevel ?? "Toepassen"}, denktips voor leerling`,
        3,
      );
      const presentation = deriveStudentPresentation({
        fullName: assignment.student.fullName,
        schoolHistory: assignment.student.profile?.schoolHistory,
        assignments: [
          {
            title: assignment.title,
            description: assignment.description,
            uitleg: assignment.uitleg,
            bloomLevel: assignment.bloomLevel,
          },
        ],
        oppTexts: [
          ...assignment.student.oppChunks.map((chunk) => chunk.tekst),
          ...oppResults,
        ],
      });

      const prompt = `Je bent Juf Aimee en geeft korte denkhulp aan een leerling.

Schrijf precies 4 korte denktips in eenvoudig Nederlands.
Elke regel moet direct bruikbaar zijn voor de leerling.
Gebruik geen inleiding, geen afsluiting en geen extra uitleg.

LEERLING
Naam: ${assignment.student.fullName}
Groep: ${assignment.student.profile?.currentSchoolYearGroup ?? assignment.student.groep ?? "onbekend"}
Interesses: ${presentation.interests.join(", ")}
Leerstijl: ${presentation.learningStyle}

OPDRACHT
Titel: ${assignment.title}
Beschrijving: ${assignment.description ?? "Geen extra beschrijving."}
Waarom deze opdracht: ${assignment.uitleg ?? "Geen extra uitleg."}

OPP CONTEXT
${oppResults.join("\n")}`;

      const response = await ollama.chat({
        model: GEN_MODEL,
        messages: [{ role: "user", content: prompt }],
        options: { temperature: 0.2, num_predict: 180 },
      });

      const tips = parseTipLines(response.message.content?.trim() ?? "");

      return NextResponse.json({
        tips:
          tips.length > 0
            ? tips
            : [
                "Lees de opdracht goed door voordat je begint.",
                "Denk na over wat je al weet over dit onderwerp.",
                "Leg uit waarom je iets denkt en geef voorbeelden.",
                "Controleer je werk voordat je het inlevert.",
              ],
      });
    } catch {
      return NextResponse.json({
        tips: [
          "Lees de opdracht goed door voordat je begint.",
          "Denk na over wat je al weet over dit onderwerp.",
          "Leg uit waarom je iets denkt en geef voorbeelden.",
          "Controleer je werk voordat je het inlevert.",
        ],
      });
    }
  }

  if (action === "reflect") {
    const { reflection = "" } = body ?? {};
    if (!reflection.trim()) {
      return NextResponse.json({ error: "Reflectie mag niet leeg zijn." }, { status: 400 });
    }
    await prisma.reflection.upsert({
      where: { assignmentId: assignment.id },
      create: { assignmentId: assignment.id, content: reflection.trim() },
      update: { content: reflection.trim() },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Onbekende actie." }, { status: 400 });
}
