import { NextRequest, NextResponse } from "next/server"
import { runAgentLoop } from "@/app/ai/agent"
import { assignmentTools } from "@/app/ai/tools"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { leerlingId } = body

  if (!leerlingId) {
    return NextResponse.json({ error: "leerlingId is verplicht" }, { status: 400 })
  }

  const student = await prisma.leerling.findUnique({ where: { id: Number(leerlingId) } })
  if (!student) {
    return NextResponse.json({ error: "Leerling niet gevonden" }, { status: 404 })
  }

  const prompt = `Genereer een passende opdracht voor leerling ${student.naam} (groep ${student.groep}).
Zoek eerst relevante informatie op uit het OPP over hun leerniveau, interesses en aandachtspunten.
Maak daarna een concrete opdracht op Bloom-niveau ${student.bloomNiveau}.
Sla de opdracht op via save_assignment met leerling_id ${student.id}.`

  const response = await runAgentLoop(
    [{ role: "user", content: prompt }],
    assignmentTools,
    { leerlingId: student.id }
  )

  return NextResponse.json({ response })
}
