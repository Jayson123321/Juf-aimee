import { NextRequest, NextResponse } from "next/server"
import { runAgent } from "@/lib/agent"
import { allTools } from "@/lib/tools"
import { executeListStudents } from "@/lib/tools/lookupDatabase"

export async function POST(req: NextRequest) {
  const { message, studentId, history } = await req.json()

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message is required" }, { status: 400 })
  }

  const studentList = await executeListStudents()

  const response = await runAgent(
    message,
    allTools,
    { studentId: studentId ? String(studentId) : undefined, studentList, history }
  )

  return NextResponse.json({ response })
}
