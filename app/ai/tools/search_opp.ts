import type { Tool } from "ollama"
import { prisma } from "@/lib/db"
import { getEmbedding } from "@/lib/ollama"

export const searchOppTool: Tool = {
  type: "function",
  function: {
    name: "search_opp",
    description:
      "Zoek relevante informatie op uit het OPP (ontwikkelingsperspectief) van de leerling. Gebruik dit om informatie te vinden over leerniveau, interesses, aandachtspunten, doelen of onderwijsbehoeften.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Wat je wilt opzoeken, bijv. 'leesniveau' of 'aandachtspunten rekenen'",
        },
      },
      required: ["query"],
    },
  },
}

export async function executeSearchOpp(leerlingId: number, query: string, limit = 3): Promise<string> {
  const vector = await getEmbedding(query)
  const vectorStr = `[${vector.join(",")}]`

  const results = await prisma.$queryRaw<{ tekst: string; score: number }[]>`
    SELECT tekst, 1 - (embedding <=> ${vectorStr}::vector) as score
    FROM "OppChunk"
    WHERE "leerlingId" = ${leerlingId}
    ORDER BY embedding <=> ${vectorStr}::vector
    LIMIT ${limit}
  `

  if (results.length === 0) return "Geen relevante informatie gevonden in het OPP."

  return results
    .map((r, i) => `[Resultaat ${i + 1} - score: ${r.score.toFixed(3)}]\n${r.tekst}`)
    .join("\n\n")
}
