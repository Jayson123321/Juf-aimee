import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"
import { Ollama } from "ollama"
import "dotenv/config"

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })
const ollama = new Ollama({ host: "http://localhost:11434" })

const EMBED_MODEL = "jeffh/intfloat-multilingual-e5-large:f16"

async function getEmbedding(text: string): Promise<number[]> {
  const response = await ollama.embed({
    model: EMBED_MODEL,
    input: `query: ${text}`,
  })
  return response.embeddings[0]
}

async function zoekOppChunks(leerlingId: number, vraag: string, aantalResultaten = 3) {
  console.log(`\nZoeken voor leerling ${leerlingId}: "${vraag}"\n`)

  const vector = await getEmbedding(vraag)
  const vectorStr = `[${vector.join(",")}]`

  const resultaten = await prisma.$queryRaw<{ tekst: string; score: number }[]>`
    SELECT tekst, 1 - (embedding <=> ${vectorStr}::vector) as score
    FROM "OppChunk"
    WHERE "leerlingId" = ${leerlingId}
    ORDER BY embedding <=> ${vectorStr}::vector
    LIMIT ${aantalResultaten}
  `

  resultaten.forEach((r, i) => {
    console.log(`--- Resultaat ${i + 1} (score: ${r.score.toFixed(3)}) ---`)
    console.log(r.tekst)
    console.log()
  })
}

async function main() {
  // Test 1: aandachtspunten Noah
  await zoekOppChunks(1, "Genereer een opdracht op basis van aandachtspunten en onderwijsbehoefte")

  // Test 2: interesses Noah
  await zoekOppChunks(1, "interesses en motivatie")

  // Test 3: Julia faalangst
  await zoekOppChunks(1, "faalangst en perfectionisme")

  await prisma.$disconnect()
}

main().catch(console.error)