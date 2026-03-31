import type { Tool } from "ollama"
import { prisma } from "@/lib/db"

// ── Student tools ──────────────────────────────────────────────

export const listStudentsTool: Tool = {
  type: "function",
  function: {
    name: "list_students",
    description: "Returns a list of all students with their ID, name, group and Bloom level.",
    parameters: { type: "object", properties: {}, required: [] },
  },
}

export const getStudentInfoTool: Tool = {
  type: "function",
  function: {
    name: "get_student_info",
    description: "Returns detailed information about one student by ID, including recent assignments.",
    parameters: {
      type: "object",
      properties: {
        student_id: { type: "string", description: "The student ID" },
      },
      required: ["student_id"],
    },
  },
}

export async function executeListStudents(): Promise<string> {
  const students = await prisma.student.findMany({
    select: { id: true, fullName: true, groep: true, bloomNiveau: true },
    orderBy: { fullName: "asc" },
  })

  if (students.length === 0) return "No students found."

  return students
    .map((s) => `ID: ${s.id} | ${s.fullName} | Group ${s.groep ?? "Unknown"} | Bloom level ${s.bloomNiveau}`)
    .join("\n")
}

export async function executeGetStudentInfo(studentId: string): Promise<string> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { assignments: { orderBy: { createdAt: "desc" }, take: 3 } },
  })

  if (!student) return `No student found with ID ${studentId}.`

  const recent =
    student.assignments.length > 0
      ? student.assignments
          .map((a) => `  - ${a.title} (level ${a.bloomNiveau}): ${(a.description ?? "").slice(0, 80)}...`)
          .join("\n")
      : "  No assignments yet."

  return `Name: ${student.fullName}\nGroup: ${student.groep ?? "Unknown"}\nBloom level: ${student.bloomNiveau}\nRecent assignments:\n${recent}`
}

// ── Assignment tools ───────────────────────────────────────────

export const getAssignmentsTool: Tool = {
  type: "function",
  function: {
    name: "get_student_assignments",
    description: "Retrieves previously generated assignments for a student.",
    parameters: {
      type: "object",
      properties: {
        student_id: { type: "string", description: "The student ID" },
      },
      required: ["student_id"],
    },
  },
}

export const saveAssignmentTool: Tool = {
  type: "function",
  function: {
    name: "save_assignment",
    description: "Save a generated assignment to the database for a student.",
    parameters: {
      type: "object",
      properties: {
        student_id:  { type: "string", description: "The student ID" },
        tekst:       { type: "string", description: "The full assignment text" },
        bloom_niveau: { type: "number", description: "Bloom level (1-6)" },
        bloom_naam:  { type: "string", description: "Bloom level name, e.g. 'Apply'" },
        uitleg:      { type: "string", description: "Explanation of why this assignment fits the student" },
      },
      required: ["student_id", "tekst", "bloom_niveau", "bloom_naam", "uitleg"],
    },
  },
}

export const updateBloomLevelTool: Tool = {
  type: "function",
  function: {
    name: "update_bloom_level",
    description: "Update the Bloom level of a student.",
    parameters: {
      type: "object",
      properties: {
        student_id:   { type: "string", description: "The student ID" },
        bloom_niveau: { type: "number", description: "New Bloom level (1-6)" },
      },
      required: ["student_id", "bloom_niveau"],
    },
  },
}

export async function executeGetAssignments(studentId: string): Promise<string> {
  const assignments = await prisma.assignment.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  if (assignments.length === 0) return "No assignments found for this student."

  return assignments
    .map((a) => `[${a.title} - level ${a.bloomNiveau}]\n${a.description ?? ""}\nExplanation: ${a.uitleg ?? ""}`)
    .join("\n\n---\n\n")
}

export async function executeSaveAssignment(args: {
  student_id: string
  tekst: string
  bloom_niveau: number
  bloom_naam: string
  uitleg: string
}): Promise<string> {
  const student = await prisma.student.findUnique({ where: { id: args.student_id } })
  if (!student) {
    const all = await prisma.student.findMany({ select: { id: true, fullName: true } })
    const list = all.map((s) => `${s.fullName}: ${s.id}`).join("\n")
    return `Error: student_id "${args.student_id}" does not exist. Use one of these exact IDs:\n${list}`
  }

  const assignment = await prisma.assignment.create({
    data: {
      studentId:   args.student_id,
      description: args.tekst,
      bloomNiveau: args.bloom_niveau,
      bloomLevel:  String(args.bloom_niveau),
      title:       args.bloom_naam,
      uitleg:      args.uitleg,
    },
  })
  return `Assignment saved with ID ${assignment.id}.`
}

export async function executeUpdateBloomLevel(studentId: string, bloomNiveau: number): Promise<string> {
  if (bloomNiveau < 1 || bloomNiveau > 6) return "Invalid Bloom level. Must be between 1 and 6."

  await prisma.student.update({ where: { id: studentId }, data: { bloomNiveau } })
  return `Bloom level of student ${studentId} updated to level ${bloomNiveau}.`
}
