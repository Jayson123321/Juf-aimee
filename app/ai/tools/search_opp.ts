import type { Tool } from "ollama";
import { prisma } from "@/lib/db";
import { getEmbedding } from "@/lib/ollama";

export const searchOppTool: Tool = {
  type: "function",
  function: {
    name: "search_opp",
    description:
      "Zoek relevante informatie op uit het OPP (ontwikkelingsperspectief) van de leerling.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Wat je wilt opzoeken, bijvoorbeeld leesniveau of aandachtspunten rekenen",
        },
      },
      required: ["query"],
    },
  },
};

export async function executeSearchOpp(
  leerlingId: string,
  query: string,
  limit = 3
): Promise<string> {
  const vector = await getEmbedding(query);
  const vectorStr = `[${vector.join(",")}]`;

  const results = await prisma.$queryRaw<{ tekst: string; score: number }[]>`
    SELECT tekst, 1 - (embedding <=> ${vectorStr}::vector) as score
    FROM "OppChunk"
    WHERE "studentId" = ${leerlingId}
    ORDER BY embedding <=> ${vectorStr}::vector
    LIMIT ${limit}
  `;

  if (results.length === 0) return "Geen relevante informatie gevonden in het OPP.";

  return results
    .map((result, index) => `[Resultaat ${index + 1} - score: ${result.score.toFixed(3)}]\n${result.tekst}`)
    .join("\n\n");
}
