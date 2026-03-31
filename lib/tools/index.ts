import type { Tool } from "ollama"
import { listStudentsTool, executeListStudents } from "./lookupDatabase"
import { searchDocsTool, executeSearchDocs } from "./searchDocs"

export const allTools: Tool[] = [
  listStudentsTool,
  searchDocsTool,
]

export const assignmentTools: Tool[] = []

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  context: { studentId?: string } = {}
): Promise<string> {
  switch (name) {
    case "list_students":
      return executeListStudents()
    case "search_opp": {
      const studentId = context.studentId ?? (args.student_id as string)
      if (!studentId) return "No student ID provided. Call list_students first to get the student ID."
      return executeSearchDocs(studentId, args.query as string)
    }
    default:
      return `Unknown tool: ${name}`
  }
}
