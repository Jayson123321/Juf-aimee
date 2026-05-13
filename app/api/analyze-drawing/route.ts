import { NextRequest, NextResponse } from "next/server"
import { ollama } from "@/lib/ollama"
import { prisma } from "@/lib/db"
import { MODELS } from "@/lib/llm-models"

export async function POST(req: NextRequest) {
  const { submissionId } = await req.json()

  if (!submissionId) {
    return NextResponse.json({ error: "submissionId is verplicht." }, { status: 400 })
  }

  const submission = await prisma.assignmentSubmission.findUnique({
    where: { id: submissionId },
    select: {
      filePath: true,
      mimeType: true,
      assignment: { select: { description: true } },
    },
  })

  if (!submission) {
    return NextResponse.json({ error: "Submission niet gevonden." }, { status: 404 })
  }

  const drawingConfig = MODELS.drawing
  const opdrachtContext = submission.assignment.description
    ? `De opdracht was: "${submission.assignment.description}"\n\nAnalyseer nu de tekening van de leerling.`
    : "Analyseer de tekening van de leerling."

  try {
    const response = await ollama.chat({
      model: drawingConfig.model,
      messages: [
        {
          role: "system",
          content: drawingConfig.prompt,
        },
        {
          role: "user",
          content: opdrachtContext,
          images: [submission.filePath],
        },
      ],
      options: { temperature: 0.3 },
      keep_alive: 0,
    })

    const analysis = response.message.content?.trim() ?? ""
    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("[analyze-drawing] Fout:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analyse mislukt." },
      { status: 500 },
    )
  }
}
