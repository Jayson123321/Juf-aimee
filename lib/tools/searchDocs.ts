import type { Tool } from "ollama"
import { prisma } from "@/lib/db"
import { getEmbedding } from "@/lib/ollama"

export const searchDocsTool: Tool = {
  type: "function",
  function: {
    name: "search_opp",
    description: "Search the student's OPP for learning level, interests, goals or attention points.",
    parameters: {
      type: "object",
      properties: {
        student_id: { type: "string", description: "The UUID of the student, obtained from list_students" },
        query: { type: "string", description: "What to search for, e.g. 'reading level' or 'attention points'" },
      },
      required: ["student_id", "query"],
    },
  },
}

export async function executeSearchDocs(studentId: string, query: string): Promise<string> {
  const vector = await getEmbedding(query)
  const vectorStr = `[${vector.join(",")}]`

  const results = await prisma.$queryRaw<{ tekst: string; score: number }[]>`
    SELECT tekst, 1 - (embedding <=> ${vectorStr}::vector) as score
    FROM "OppChunk"
    WHERE "studentId" = ${studentId}
    ORDER BY embedding <=> ${vectorStr}::vector
    LIMIT 3
  `

  if (results.length === 0) return "No relevant information found in the OPP."

  return results
    .map((r, i) => `[Result ${i + 1} - score: ${r.score.toFixed(3)}]\n${r.tekst}`)
    .join("\n\n")
}
