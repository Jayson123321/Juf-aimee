import { NextRequest, NextResponse } from "next/server"
import { runAgent } from "@/lib/agent"
import { allTools } from "@/lib/tools"

export async function POST(req: NextRequest) {
  const { message, studentId } = await req.json()

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message is required" }, { status: 400 })
  }

  const response = await runAgent(message, allTools, { studentId: studentId ? String(studentId) : undefined })

  return NextResponse.json({ response })
}
