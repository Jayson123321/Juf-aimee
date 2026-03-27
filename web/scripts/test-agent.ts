import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"
import { Ollama } from "ollama"
import type { Message, Tool } from "ollama"
import "dotenv/config"

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })
const ollama = new Ollama({ host: "http://localhost:11434" })

const EMBED_MODEL = "jeffh/intfloat-multilingual-e5-large:f16"
const GEN_MODEL = "llama3.1"

async function getEmbedding(text: string): Promise<number[]> {
  const response = await ollama.embed({
    model: EMBED_MODEL,
    input: `query: ${text}`,
  })
  return response.embeddings[0]
}

async function searchOpp(leerlingId: number, query: string, limit = 3): Promise<string> {
  const vector = await getEmbedding(query)
  const vectorStr = `[${vector.join(",")}]`

  const results = await prisma.$queryRaw<{ tekst: string; score: number }[]>`
    SELECT tekst, 1 - (embedding <=> ${vectorStr}::vector) as score
    FROM "OppChunk"
    WHERE "leerlingId" = ${leerlingId}
    ORDER BY embedding <=> ${vectorStr}::vector
    LIMIT ${limit}
  `

  return results
    .map((r, i) => `[Resultaat ${i + 1} - score: ${r.score.toFixed(3)}]\n${r.tekst}`)
    .join("\n\n")
}

const tools: Tool[] = [
  {
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
  },
]

async function runAgent(leerlingId: number, leerlingNaam: string) {
  console.log(`\n=== Agent test voor ${leerlingNaam} (id: ${leerlingId}) ===\n`)

  const messages: Message[] = [
    {
      role: "user",
      content: `Genereer een passende opdracht voor leerling ${leerlingNaam}.
Zoek eerst relevante informatie op uit het OPP over hun leerniveau, interesses en aandachtspunten, Individueel Handelingsplan Didactisch.
Maak daarna een concrete opdracht op Bloom-niveau 3 (toepassen).`,
    },
  ]

  // agent loop
  while (true) {
    console.log("LLM aan het denken...")
    const response = await ollama.chat({
      model: GEN_MODEL,
      messages,
      tools,
    })

    messages.push(response.message)

    // no tool calls → final answer
    if (!response.message.tool_calls || response.message.tool_calls.length === 0) {
      console.log("\n=== Gegenereerde opdracht ===\n")
      console.log(response.message.content)
      break
    }

    // execute tool calls
    for (const call of response.message.tool_calls) {
      const args = call.function.arguments as { query: string }
      console.log(`  → Tool: search_opp("${args.query}")`)

      const result = await searchOpp(leerlingId, args.query)
      console.log(`  ← ${result.length} tekens gevonden\n`)

      messages.push({
        role: "tool",
        content: result,
      })
    }
  }

  await prisma.$disconnect()
}

// Test met leerling id 1
runAgent(2, "Milan de Groot").catch(console.error)
