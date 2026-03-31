import type { Tool } from "ollama"
import { prisma } from "@/lib/db"

export const listStudentsTool: Tool = {
  type: "function",
  function: {
    name: "list_students",
    description: "Returns a list of all students including their ID.",
    parameters: { type: "object", properties: {}, required: [] },
  },
}

export async function executeListStudents(): Promise<string> {
  const students = await prisma.student.findMany({
    select: { id: true, fullName: true, groep: true, bloomNiveau: true },
    orderBy: { fullName: "asc" },
  })

  if (students.length === 0) return "No students found."

  return students
    .map((s) => `student_id: ${s.id} | ${s.fullName} | Group ${s.groep} | Bloom level ${s.bloomNiveau}`)
    .join("\n")
}
