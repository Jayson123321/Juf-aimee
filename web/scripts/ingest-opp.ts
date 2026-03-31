import mammoth from "mammoth"
import { Ollama } from "ollama"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"
import path from "path"
import "dotenv/config"

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })
console.log("Prisma models:", Object.keys(prisma))
const ollama = new Ollama({ host: "http://localhost:11434" })

const EMBED_MODEL = "jeffh/intfloat-multilingual-e5-large:f16" // Ai model 
const OPP_MAP = path.join(__dirname, "../../OPP_bestanden")

function chunkText(text: string, chunkSize = 400): string[] {
  const paragraphs = text.split(/\n{2,}/)
  const chunks: string[] = []
  let current = ""

  for (const paragraph of paragraphs) {
    const clean = paragraph.trim()
    if (!clean) continue
    if ((current + " " + clean).length > chunkSize) {
      if (current) chunks.push(current.trim())
      current = clean
    } else {
      current += " " + clean
    }
  }

  if (current) chunks.push(current.trim())
  return chunks.filter(c => c.length > 50)
}

async function getEmbedding(text: string): Promise<number[]> {
  const response = await ollama.embed({
    model: EMBED_MODEL,
    input: `passage: ${text}`,
  })
  return response.embeddings[0]
}

async function ingestOpp(bestand: string, leerlingId: number) {
  const filePath = path.join(OPP_MAP, bestand)
  console.log(`Inladen: ${filePath}`)

  const { value: text } = await mammoth.extractRawText({ path: filePath })
  const chunks = chunkText(text)

  console.log(`${chunks.length} chunks gevonden`)

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const embedding = await getEmbedding(chunk)
    const vectorStr = `[${embedding.join(",")}]`

    await prisma.$executeRaw`
      INSERT INTO "OppChunk" ("leerlingId", "tekst", "embedding", "createdAt")
      VALUES (${leerlingId}, ${chunk}, ${vectorStr}::vector, NOW())
    `

    console.log(`Chunk ${i + 1}/${chunks.length} opgeslagen`)
  }

  console.log(`Klaar voor leerling ${leerlingId}!\n`)
}

async function main() {
  const leerlingen = [
    { naam: "Julia van Loon", groep: 6, bestand: "OPP_1.docx" },
    { naam: "Milan de Groot", groep: 6, bestand: "OPP_2.docx" },
    { naam: "Sophie Meijer", groep: 5, bestand: "OPP_3.docx" },
    { naam: "Daan Verbeek", groep: 6, bestand: "OPP_4.docx" },
    { naam: "Emma Koster", groep: 4, bestand: "OPP_5.docx" },
    { naam: "Noah Smit", groep: 6, bestand: "OPP_6.docx" },
  ]

  for (const l of leerlingen) {
    const result = await prisma.$queryRaw<{ id: number }[]>`
      INSERT INTO "Leerling" ("naam", "groep", "bloomNiveau", "createdAt")
      VALUES (${l.naam}, ${l.groep}, ${1}, NOW())
      RETURNING id
    `
    const leerlingId = result[0].id
    console.log(`Leerling aangemaakt: ${l.naam} (id: ${leerlingId})`)
    await ingestOpp(l.bestand, leerlingId)
  }

  await prisma.$disconnect()
  console.log("Alle OPP's succesvol ingeladen!")
}
main().catch(console.error)