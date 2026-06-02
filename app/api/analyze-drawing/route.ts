import { NextRequest, NextResponse } from "next/server"
import { ollama } from "@/lib/ollama"
import { prisma } from "@/lib/db"
import { MODELS } from "@/lib/llm-models"

export async function POST(req: NextRequest) {
  const { submissionId, existingFeedback } = await req.json()

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

  const messages = existingFeedback
    ? [
        { role: "system" as const, content: drawingConfig.prompt },
        { role: "user" as const, content: opdrachtContext, images: [submission.filePath] },
        { role: "assistant" as const, content: existingFeedback },
        {
          role: "user" as const,
          content:
            "Bekijk de tekening opnieuw zorgvuldig. Verbeter de bovenstaande feedback: vul ontbrekende of onvolledige punten aan, corrigeer onjuiste observaties en maak vage punten concreter. Geef de volledige verbeterde versie terug in hetzelfde formaat.",
        },
      ]
    : [
        { role: "system" as const, content: drawingConfig.prompt },
        { role: "user" as const, content: opdrachtContext, images: [submission.filePath] },
      ]

  try {
    const response = await ollama.chat({
      model: drawingConfig.model,
      messages,
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
