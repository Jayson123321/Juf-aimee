import type { Tool } from "ollama"
import { searchOppTool, executeSearchOpp } from "./search_opp"
import { listStudentsTool, getStudentInfoTool, executeListStudents, executeGetStudentInfo } from "./students"
import {
  getStudentAssignmentsTool,
  saveAssignmentTool,
  updateBloomLevelTool,
  executeGetStudentAssignments,
  executeSaveAssignment,
  executeUpdateBloomLevel,
} from "./assignments"

// All tools available to the chat agent
export const allTools: Tool[] = [
  searchOppTool,
  listStudentsTool,
  getStudentInfoTool,
  getStudentAssignmentsTool,
  saveAssignmentTool,
  updateBloomLevelTool,
]

// Subset for assignment generation only
export const assignmentTools: Tool[] = [searchOppTool, saveAssignmentTool]

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  context: { leerlingId?: string } = {}
): Promise<string> {
  switch (name) {
    case "search_opp": {
      const leerlingId = context.leerlingId ?? (args.leerling_id as string)
      if (!leerlingId) return "Geen leerling ID beschikbaar voor OPP zoekopdracht."
      return executeSearchOpp(leerlingId, args.query as string).then((results) => results.join("\n\n"))
    }
    case "list_students":
      return executeListStudents()
    case "get_student_info":
      return executeGetStudentInfo(args.leerling_id as string)
    case "get_student_assignments":
      return executeGetStudentAssignments(args.leerling_id as string)
    case "save_assignment":
      return executeSaveAssignment(args as Parameters<typeof executeSaveAssignment>[0])
    case "update_bloom_level":
      return executeUpdateBloomLevel(args.leerling_id as string, args.bloom_niveau as number)
    default:
      return `Onbekende tool: ${name}`
  }
}
