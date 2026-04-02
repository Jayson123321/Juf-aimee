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

type IngestStudent = {
  fullName: string
  groep: string
  bloomNiveau: number
  file: string
}

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
  return chunks.map(sanitizeChunkText).filter((c) => c.length > 50)
}

function sanitizeChunkText(text: string) {
  return text
    .normalize("NFKC")
    .replace(/\u0000/g, " ")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function isValidEmbedding(embedding: number[]) {
  return (
    Array.isArray(embedding) &&
    embedding.length > 0 &&
    embedding.every((value) => Number.isFinite(value))
  )
}

function previewText(text: string, maxLength = 120) {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`
}

async function getEmbedding(text: string): Promise<number[]> {
  const response = await ollama.embed({
    model: EMBED_MODEL,
    input: `passage: ${text}`,
  })
  const embedding = response.embeddings[0]
  if (!isValidEmbedding(embedding)) {
    throw new Error("Embedding bevat ongeldige waarden")
  }
  return embedding
}

async function ingestOpp(file: string, studentId: string) {
  const filePath = path.join(OPP_DIR, file)
  console.log(`Reading: ${filePath}`)

  const { value: text } = await mammoth.extractRawText({ path: filePath })
  const chunks = chunkText(text)

  console.log(`${chunks.length} chunks found`)

  let savedCount = 0
  let skippedCount = 0

  for (let i = 0; i < chunks.length; i++) {
    const originalChunk = chunks[i]
    const variants = [
      originalChunk,
      sanitizeChunkText(originalChunk).replace(/[^\p{L}\p{N}\p{P}\p{Zs}]/gu, " "),
    ]

    let saved = false

    for (let attempt = 0; attempt < variants.length; attempt++) {
      const chunk = sanitizeChunkText(variants[attempt])
      if (chunk.length <= 50) continue

      try {
        const embedding = await getEmbedding(chunk)
        const vectorStr = `[${embedding.join(",")}]`

        await prisma.$executeRaw`
          INSERT INTO "OppChunk" ("studentId", "tekst", "embedding")
          VALUES (${studentId}, ${chunk}, ${vectorStr}::vector)
        `

        savedCount += 1
        saved = true
        console.log(`Chunk ${i + 1}/${chunks.length} saved`)
        break
      } catch (error) {
        const isLastAttempt = attempt === variants.length - 1
        if (isLastAttempt) {
          skippedCount += 1
          console.warn(
            `Chunk ${i + 1}/${chunks.length} skipped: ${error instanceof Error ? error.message : String(error)}`,
          )
          console.warn(`Preview: ${previewText(chunk)}`)
        } else {
          console.warn(`Chunk ${i + 1}/${chunks.length} retrying with extra sanitizing`)
        }
      }
    }

    if (!saved) {
      continue
    }
  }

  console.log(`Saved ${savedCount}/${chunks.length} chunks, skipped ${skippedCount}`)
  console.log(`Done for student ${studentId}!\n`)
}

async function getOrCreateStudent(s: IngestStudent) {
  const duplicates = await prisma.student.findMany({
    where: { fullName: s.fullName },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  })

  if (duplicates.length > 1) {
    const duplicateIds = duplicates.slice(1).map((student) => student.id)
    await prisma.oppChunk.deleteMany({ where: { studentId: { in: duplicateIds } } })
    await prisma.student.deleteMany({ where: { id: { in: duplicateIds } } })
    console.log(`Duplicate student records removed for ${s.fullName}: ${duplicateIds.length}`)
  }

  const existingStudent = duplicates[0]

  if (existingStudent) {
    await prisma.oppChunk.deleteMany({ where: { studentId: existingStudent.id } })
    const updatedStudent = await prisma.student.update({
      where: { id: existingStudent.id },
      data: {
        groep: s.groep,
        bloomNiveau: s.bloomNiveau,
      },
    })
    console.log(`Student reused: ${updatedStudent.fullName} (id: ${updatedStudent.id})`)
    return updatedStudent
  }

  const createdStudent = await prisma.student.create({
    data: {
      fullName: s.fullName,
      groep: s.groep,
      bloomNiveau: s.bloomNiveau,
    },
  })
  console.log(`Student created: ${createdStudent.fullName} (id: ${createdStudent.id})`)
  return createdStudent
}

async function main() {
  const students: IngestStudent[] = [
    { fullName: "Julia van Loon",  groep: "6", bloomNiveau: 1, file: "OPP_1.docx" },
    { fullName: "Milan de Groot",  groep: "6", bloomNiveau: 1, file: "OPP_2.docx" },
    { fullName: "Sophie Meijer",   groep: "5", bloomNiveau: 1, file: "OPP_3.docx" },
    { fullName: "Daan Verbeek",    groep: "6", bloomNiveau: 1, file: "OPP_4.docx" },
    { fullName: "Emma Koster",     groep: "4", bloomNiveau: 1, file: "OPP_5.docx" },
    { fullName: "Noah Smit",       groep: "6", bloomNiveau: 1, file: "OPP_6.docx" },
  ]

  for (const s of students) {
    try {
      const student = await getOrCreateStudent(s)
      await ingestOpp(s.file, student.id)
    } catch (error) {
      console.error(`Ingest failed for ${s.fullName}:`, error)
    }
  }

  await prisma.$disconnect()
  console.log("All OPPs successfully ingested!")
}

main().catch(console.error)
