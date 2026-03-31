import type { Tool } from "ollama"
import { searchDocsTool, executeSearchDocs } from "./searchDocs"
import {
  listStudentsTool, getStudentInfoTool, getAssignmentsTool,
  saveAssignmentTool, updateBloomLevelTool,
  executeListStudents, executeGetStudentInfo, executeGetAssignments,
  executeSaveAssignment, executeUpdateBloomLevel,
} from "./lookupDatabase"

export const allTools: Tool[] = [
  searchDocsTool, listStudentsTool, getStudentInfoTool,
  getAssignmentsTool, saveAssignmentTool, updateBloomLevelTool,
]

export const assignmentTools: Tool[] = [searchDocsTool, saveAssignmentTool]

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  context: { studentId?: string } = {}
): Promise<string> {
  switch (name) {
    case "search_opp": {
      const studentId = context.studentId ?? (args.student_id as string)
      if (!studentId) return "No student ID available for OPP search."
      return executeSearchDocs(studentId, args.query as string)
    }
    case "list_students":        return executeListStudents()
    case "get_student_info":     return executeGetStudentInfo(args.student_id as string)
    case "get_student_assignments": return executeGetAssignments(args.student_id as string)
    case "save_assignment":      return executeSaveAssignment(args as Parameters<typeof executeSaveAssignment>[0])
    case "update_bloom_level":   return executeUpdateBloomLevel(args.student_id as string, args.bloom_niveau as number)
    default: return `Unknown tool: ${name}`
  }
}
