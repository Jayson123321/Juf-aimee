import { NextRequest, NextResponse } from "next/server"
import { runAgentLoop } from "@/app/ai/agent"
import { allTools } from "@/app/ai/tools"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { message, leerlingId } = body

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Bericht is verplicht" }, { status: 400 })
  }

  const response = await runAgentLoop(
    [{ role: "user", content: message }],
    allTools,
    { leerlingId: leerlingId ? Number(leerlingId) : undefined }
  )

  return NextResponse.json({ response })
}
