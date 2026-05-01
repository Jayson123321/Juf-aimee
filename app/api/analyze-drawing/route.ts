import { NextRequest, NextResponse } from "next/server"
import { ollama } from "@/lib/ollama"
import { prisma } from "@/lib/db"

const VISION_MODEL = "llava:7b"

export async function GET(req: NextRequest) {
  const submissionId = req.nextUrl.searchParams.get("submissionId")
  if (!submissionId) {
    return NextResponse.json({ error: "submissionId is verplicht." }, { status: 400 })
  }
  const submission = await prisma.assignmentSubmission.findUnique({
    where: { id: submissionId },
    select: { analysis: true },
  })
  return NextResponse.json({ analysis: submission?.analysis ?? null })
}

export async function POST(req: NextRequest) {
  const { submissionId } = await req.json()

  if (!submissionId) {
    return NextResponse.json({ error: "submissionId is verplicht." }, { status: 400 })
  }

  // Haal de submission op — filePath bevat de base64 afbeelding
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

  const prompt = `Je bent een leerkracht die een tekening van een leerling beoordeelt.
${submission.assignment.description ? `De opdracht was: "${submission.assignment.description}"` : ""}

Geef feedback in precies dit formaat (gebruik lege regels tussen de secties):

Wat is er te zien?
[Beschrijf kort en concreet wat er op de tekening staat.]

Opdracht begrepen?
[Heeft de leerling de opdracht begrepen en uitgevoerd? Leg kort uit waarom.]

Sterke punten:
- [sterk punt 1]
- [sterk punt 2]
- [sterk punt 3]

Verbeterpunten:
- [verbeterpunt 1]
- [verbeterpunt 2]

Schrijf in helder Nederlands. Wees concreet en positief. Gebruik alleen dit formaat, geen extra tekst erbuiten.`

  try {
    const response = await ollama.chat({
      model: VISION_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
          images: [submission.filePath], // filePath is base64
        },
      ],
      options: { temperature: 0.3 },
      keep_alive: 0,
    })

    const analysis = response.message.content?.trim() ?? ""

    await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: { analysis },
    })

    return NextResponse.json({ analysis })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analyse mislukt." },
      { status: 500 },
    )
  }
}
