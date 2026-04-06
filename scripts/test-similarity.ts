import "dotenv/config"
import { Ollama } from "ollama"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })
const ollama = new Ollama({ host: "http://localhost:11434" })

const EMBED_MODEL = "jeffh/intfloat-multilingual-e5-large:f16"

const MANUAL_TEXT: string | null =
  "De leerling denkt op hoog niveau en maakt snel nieuwe verbindingen. Tegelijk laat hij perfectionisme zien en kan hij blokkeren als een taak niet in één keer goed gaat. Hij heeft baat bij verrijkingsopdrachten en begeleiding in omgaan met fouten.";

async function main() {
  let baseText: string

  if (MANUAL_TEXT) {
    baseText = MANUAL_TEXT
    console.log("Gebruik handmatige test-tekst (ingekort):")
    console.log(baseText.slice(0, 200) + (baseText.length > 200 ? "..." : ""))
    console.log("(Losse tekst, geen specifieke student/Chunk ID)\n")
  } else {
    // Valt terug op een bestaand OPP-chunk uit de database
    const sample = await prisma.oppChunk.findFirst()

    if (!sample) {
      console.error("Geen OppChunk gevonden in de database. Heb je ingest al gedraaid?")
      return
    }

    baseText = sample.tekst

    console.log("Gekozen voorbeeld-chunk (ingekort):")
    console.log(sample.tekst.slice(0, 200) + (sample.tekst.length > 200 ? "..." : ""))
    console.log("StudentId:", sample.studentId)
    console.log("Chunk ID:", sample.id)
    console.log("---\n")
  }

  // 2. Maak embedding van precies deze tekst
  const embedRes = await ollama.embed({
    model: EMBED_MODEL,
    input: `passage: ${baseText}`,
  })

  const embedding = embedRes.embeddings[0]
  const vectorStr = `[${embedding.join(",")}]`

  // 3. Zoek in ALLE OppChunks op basis van cosine-similarity
  const rows = await prisma.$queryRaw<
    { id: number; studentId: string; tekst: string; similarity: number }[]
  >`
    SELECT
      "id",
      "studentId",
      "tekst",
      1 - (embedding <=> ${vectorStr}::vector) AS similarity
    FROM "OppChunk"
    ORDER BY similarity DESC
    LIMIT 10
  `

  console.log("Top 10 meest gelijkende chunks:")
  for (const row of rows) {
    console.log("----")
    console.log(`Chunk ID: ${row.id} | studentId: ${row.studentId}`)
    console.log(`Similarity: ${row.similarity.toFixed(3)}`)
    console.log(row.tekst.slice(0, 160) + (row.tekst.length > 160 ? "..." : ""))
  }
}

main()
  .catch((err) => {
    console.error(err)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
