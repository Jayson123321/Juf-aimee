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
  try {
    const vector = await getEmbedding(query);
    const vectorStr = `[${vector.join(",")}]`;

    const results = await prisma.$queryRaw<{ tekst: string; score: number }[]>`
      SELECT tekst, 1 - (embedding <=> ${vectorStr}::vector) as score
      FROM "OppChunk"
      WHERE "studentId" = ${leerlingId}
      ORDER BY embedding <=> ${vectorStr}::vector
      LIMIT ${limit}
    `;

    const validResults = results.filter(
      (result) => typeof result.tekst === "string" && Number.isFinite(result.score)
    );

    if (validResults.length > 0) {
      return validResults
        .map(
          (result, index) =>
            `[Resultaat ${index + 1} - score: ${result.score.toFixed(3)}]\n${result.tekst}`
        )
        .join("\n\n");
    }
  } catch {
    // Fall through to lexical search when embedding or vector search fails.
  }

  const normalizedTerms = query
    .toLowerCase()
    .split(/[,\s]+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 3)
    .slice(0, 6);

  const chunks = await prisma.oppChunk.findMany({
    where: { studentId: leerlingId },
    select: { tekst: true },
    take: 100,
  });

  const scoredChunks = chunks
    .map((chunk) => {
      const haystack = chunk.tekst.toLowerCase();
      const score = normalizedTerms.reduce((total, term) => {
        if (!haystack.includes(term)) return total;
        return total + (haystack.match(new RegExp(term, "g"))?.length ?? 1);
      }, 0);

      return { tekst: chunk.tekst, score };
    })
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (scoredChunks.length === 0) {
    const fallbackChunks = chunks.slice(0, limit);
    if (fallbackChunks.length === 0) return "Geen relevante informatie gevonden in het OPP.";

    return fallbackChunks
      .map((chunk, index) => `[Resultaat ${index + 1} - score: 0.000]\n${chunk.tekst}`)
      .join("\n\n");
  }

  return scoredChunks
    .map((chunk, index) => `[Resultaat ${index + 1} - score: ${chunk.score.toFixed(3)}]\n${chunk.tekst}`)
    .join("\n\n");
}
