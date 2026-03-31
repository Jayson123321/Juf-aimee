import { NextRequest, NextResponse } from "next/server"
import { runAgent } from "@/lib/agent"
import { assignmentTools } from "@/lib/tools"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const { studentId } = await req.json()

  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 })
  }

  const student = await prisma.student.findUnique({ where: { id: String(studentId) } })
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 })
  }

  const prompt = `Generate an appropriate assignment for student ${student.fullName} (group ${student.groep ?? "Unknown"}).
First search for relevant information from the OPP about their learning level, interests and attention points.
Then create a concrete assignment at Bloom level ${student.bloomNiveau}.
Save the assignment via save_assignment with student_id ${student.id}.`

  const response = await runAgent(prompt, assignmentTools, { studentId: student.id })

  return NextResponse.json({ response })
}
