import mammoth from "mammoth"
import { Ollama } from "ollama"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"
import path from "path"
import "dotenv/config"

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })
const ollama = new Ollama({ host: "http://localhost:11434" })

const EMBED_MODEL = "jeffh/intfloat-multilingual-e5-large:f16"
const OPP_DIR = path.join(__dirname, "../OPP_bestanden")

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
  return chunks.filter((c) => c.length > 50)
}

async function getEmbedding(text: string): Promise<number[]> {
  const response = await ollama.embed({
    model: EMBED_MODEL,
    input: `passage: ${text}`,
  })
  return response.embeddings[0]
}

async function ingestOpp(file: string, studentId: string) {
  const filePath = path.join(OPP_DIR, file)
  console.log(`Reading: ${filePath}`)

  const { value: text } = await mammoth.extractRawText({ path: filePath })
  const chunks = chunkText(text)

  console.log(`${chunks.length} chunks found`)

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const embedding = await getEmbedding(chunk)
    const vectorStr = `[${embedding.join(",")}]`

    await prisma.$executeRaw`
      INSERT INTO "OppChunk" ("studentId", "tekst", "embedding")
      VALUES (${studentId}, ${chunk}, ${vectorStr}::vector)
    `

    console.log(`Chunk ${i + 1}/${chunks.length} saved`)
  }

  console.log(`Done for student ${studentId}!\n`)
}

async function main() {
  const students = [
    { fullName: "Julia van Loon",  groep: "6", bloomNiveau: 1, file: "OPP_1.docx" },
    { fullName: "Milan de Groot",  groep: "6", bloomNiveau: 1, file: "OPP_2.docx" },
    { fullName: "Sophie Meijer",   groep: "5", bloomNiveau: 1, file: "OPP_3.docx" },
    { fullName: "Daan Verbeek",    groep: "6", bloomNiveau: 1, file: "OPP_4.docx" },
    { fullName: "Emma Koster",     groep: "4", bloomNiveau: 1, file: "OPP_5.docx" },
    { fullName: "Noah Smit",       groep: "6", bloomNiveau: 1, file: "OPP_6.docx" },
  ]

  for (const s of students) {
    const student = await prisma.student.create({
      data: {
        fullName: s.fullName,
        groep: s.groep,
        bloomNiveau: s.bloomNiveau,
      },
    })
    console.log(`Student created: ${student.fullName} (id: ${student.id})`)
    await ingestOpp(s.file, student.id)
  }

  await prisma.$disconnect()
  console.log("All OPPs successfully ingested!")
}

main().catch(console.error)
