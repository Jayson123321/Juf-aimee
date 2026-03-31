import type { Tool } from "ollama"
import { listStudentsTool, executeListStudents } from "./lookupDatabase"

export const allTools: Tool[] = [listStudentsTool]

export const assignmentTools: Tool[] = []

export async function executeTool(name: string): Promise<string> {
  switch (name) {
    case "list_students":
      return executeListStudents()
    default:
      return `Unknown tool: ${name}`
  }
}
