import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ALLOWED_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword",                                                        // .doc
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const assignmentId = formData.get("assignmentId") as string | null;
    const studentId = formData.get("studentId") as string | null;

    if (!file || !assignmentId || !studentId) {
      return NextResponse.json(
        { error: "Bestand, assignmentId en studentId zijn verplicht." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Bestandstype niet toegestaan. Gebruik .docx, .doc, .pdf of een afbeelding." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Bestand is te groot. Maximum is 10 MB." },
        { status: 400 }
      );
    }

    // Controleer of de opdracht bij de leerling hoort
    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, studentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Opdracht niet gevonden." },
        { status: 404 }
      );
    }

    // Bestand opslaan als base64 in filePath
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const submission = await prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        fileName: file.name,
        filePath: base64,
        mimeType: file.type,
        fileSize: file.size,
      },
    });

    // Status op IN_PROGRESS zetten als die nog PENDING is
    if (assignment.status === "PENDING") {
      await prisma.assignment.update({
        where: { id: assignmentId },
        data: { status: "IN_PROGRESS", savedAt: new Date() },
      });
    }

    return NextResponse.json({
      ok: true,
      submission: {
        id: submission.id,
        fileName: submission.fileName,
        fileSize: submission.fileSize,
        uploadedAt: submission.uploadedAt,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Uploaden mislukt. Probeer het opnieuw." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const assignmentId = searchParams.get("assignmentId");

  if (!assignmentId) {
    return NextResponse.json({ error: "assignmentId is verplicht." }, { status: 400 });
  }

  const submissions = await prisma.assignmentSubmission.findMany({
    where: { assignmentId },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
      filePath: true,
      uploadedAt: true,
    },
    orderBy: { uploadedAt: "desc" },
  });

  return NextResponse.json({ submissions });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const submissionId = searchParams.get("submissionId");
  const studentId = searchParams.get("studentId");

  if (!submissionId || !studentId) {
    return NextResponse.json({ error: "submissionId en studentId zijn verplicht." }, { status: 400 });
  }

  // Controleer of het bestand bij de leerling hoort
  const submission = await prisma.assignmentSubmission.findFirst({
    where: {
      id: submissionId,
      assignment: { studentId },
    },
  });

  if (!submission) {
    return NextResponse.json({ error: "Bestand niet gevonden." }, { status: 404 });
  }

  await prisma.assignmentSubmission.delete({ where: { id: submissionId } });

  return NextResponse.json({ ok: true });
}
