import { NextRequest, NextResponse } from "next/server"
import { ollama, GEN_MODEL } from "@/lib/ollama"

const GROEPEN = ["Groep 3", "Groep 4", "Groep 5", "Groep 6", "Groep 7", "Groep 8"] as const
const SUBJECTS = [
  "Taal",
  "Rekenen",
  "Aardrijkskunde",
  "Geschiedenis",
  "Natuur & Techniek",
  "Engels",
] as const
const LEVELS = ["Below average", "Average", "Advanced"] as const
const TYPES = [
  "Written exercise",
  "Creative project",
  "Presentation",
  "Research task",
  "Worksheet",
] as const
const DURATIONS = ["10 min", "20 min", "30 min", "1 hour", "Whole Day Assignment"] as const
const CONTEXTS = [
  "Introduction to new topic",
  "Practice of known material",
  "Mastery check",
] as const
const NEEDS = ["Dyslexia", "Dyscalculia", "ADHD", "None"] as const

const ASSIGNMENT_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    intro: { type: "string" },
    steps: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
    },
    closer: { type: "string" },
  },
  required: ["title", "intro", "steps", "closer"],
} as const

type AssignmentJSON = {
  title: string
  intro: string
  steps: string[]
  closer: string
}

type Groep = (typeof GROEPEN)[number]
type Subject = (typeof SUBJECTS)[number]
type Level = (typeof LEVELS)[number]
type AssignmentType = (typeof TYPES)[number]
type Duration = (typeof DURATIONS)[number]
type Context = (typeof CONTEXTS)[number]
type Need = (typeof NEEDS)[number]

const rateLimit = new Map<string, number[]>()
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 5

function clean(s: unknown, max: number) {
  if (typeof s !== "string") return ""
  return s.replace(/[\r\n]+/g, " ").trim().slice(0, max)
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const now = Date.now()
  const hits = (rateLimit.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (hits.length >= MAX_PER_WINDOW) {
    return NextResponse.json(
      { error: "Even rustig aan — probeer het over een minuutje opnieuw." },
      { status: 429 },
    )
  }
  rateLimit.set(ip, [...hits, now])

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 })
  }

  const groep = body.groep as Groep
  const subject = body.subject as Subject
  const level = body.level as Level
  const type = body.type as AssignmentType
  const duration = body.duration as Duration
  const context = body.context as Context

  if (
    !GROEPEN.includes(groep) ||
    !SUBJECTS.includes(subject) ||
    !LEVELS.includes(level) ||
    !TYPES.includes(type) ||
    !DURATIONS.includes(duration) ||
    !CONTEXTS.includes(context)
  ) {
    return NextResponse.json({ error: "Selecteer alle verplichte velden." }, { status: 400 })
  }

  const topic = clean(body.topic, 80)
  const objective = clean(body.objective, 200)
  const notes = clean(body.notes, 300)

  if (!topic) {
    return NextResponse.json({ error: "Onderwerp is verplicht." }, { status: 400 })
  }

  const needs = (Array.isArray(body.needs) ? body.needs : []).filter((n): n is Need =>
    NEEDS.includes(n as Need),
  )
  const realNeeds = needs.filter((n) => n !== "None")

  const objectiveLine = objective ? `- Leerdoel: "${objective}"` : ""
  const needsLine = realNeeds.length
    ? `- Houd rekening met: ${realNeeds.join(", ")}`
    : ""
  const notesLine = notes ? `- Extra notitie van de leerkracht: "${notes}"` : ""

  const systemPrompt = `Je bent Juf Aimee, een AI-onderwijsassistent voor de basisschool. Schrijf één leeropdracht per keer.

Regels die ALTIJD gelden, ook zonder dat de leerkracht erom vraagt:
- Concrete inhoud: noem echte getallen, voorbeelden, woorden, plaatsnamen — geen "een aantal", "iets", of "bijvoorbeeld …".
- Bij rekenen: schrijf de sommen of vergelijkingen volledig uit (3 × 4 = …, niet "doe een vermenigvuldiging"). Geef minstens 4-6 concrete sommen waar de leerling op kan rekenen.
- Bij taal: geef de exacte zinnen of woorden waarmee de leerling moet werken, niet alleen een opdracht-omschrijving.
- Bij aardrijkskunde, geschiedenis of natuur: noem specifieke plekken, namen, jaartallen, of voorbeelden uit het echte leven.
- Toets jezelf: kan de leerling met alleen jouw opdracht direct beginnen, zonder iets te hoeven raden of vragen? Zo nee, herschrijf.

Volg het gevraagde formaat exact. Spreek de leerling altijd direct aan met "jij" en "je".`

  const userPrompt = `Maak een leeropdracht met deze eigenschappen:
- Groep: ${groep}
- Vak: ${subject}
- Onderwerp: ${topic}
- Niveau leerling: ${level}
- Type opdracht: ${type}
- Tijdsduur: ${duration}
- Context: ${context}
${objectiveLine}
${needsLine}
${notesLine}

Voor je begint: bedenk welke concrete elementen passen bij Vak="${subject}" + Onderwerp="${topic}". Bijvoorbeeld: getallen, formules, woorden, plaatsnamen, jaartallen, voorbeelden. Verwerk deze automatisch in de opdracht — ook als de leerkracht er niet expliciet om vraagt.

Geef terug als geldig JSON met EXACT deze velden (en geen andere):
- "title" (string): pakkende titel op één regel
- "intro" (string): 2-3 zinnen instructie, direct aan de leerling, op het leesniveau van ${groep}
- "steps" (array van strings): concrete stappen die de leerling uitvoert; zoveel stappen als de tijdsduur "${duration}" toelaat (minstens 2)
- "closer" (string): 1 afsluitende, motiverende zin

Antwoord ALLEEN met geldig JSON. Geen markdown, geen code-blokken, geen extra tekst eromheen. Schrijf in helder Nederlands op het leesniveau van ${groep}.`

  console.log("\n========== [landing-demo] PROMPT ==========")
  console.log("--- system ---")
  console.log(systemPrompt)
  console.log("--- user ---")
  console.log(userPrompt)
  console.log("===========================================\n")

  try {
    const startedAt = Date.now()
    const res = await ollama.chat({
      model: GEN_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      format: ASSIGNMENT_SCHEMA,
      options: {
        temperature: 0.6,
      },
    })
    const raw = res.message.content?.trim() ?? ""
    console.log(`\n========== [landing-demo] RESPONSE (${Date.now() - startedAt}ms) ==========`)
    console.log(raw)
    console.log("===============================================================\n")
    if (!raw) {
      return NextResponse.json(
        { error: "Geen opdracht ontvangen. Probeer het opnieuw." },
        { status: 502 },
      )
    }
    let parsed: AssignmentJSON
    try {
      parsed = JSON.parse(raw)
    } catch {
      return NextResponse.json(
        { error: "Ongeldig antwoord van model. Probeer opnieuw." },
        { status: 502 },
      )
    }
    if (
      typeof parsed.title !== "string" ||
      typeof parsed.intro !== "string" ||
      !Array.isArray(parsed.steps) ||
      typeof parsed.closer !== "string"
    ) {
      return NextResponse.json(
        { error: "Incompleet antwoord van model. Probeer opnieuw." },
        { status: 502 },
      )
    }
    return NextResponse.json({ assignment: parsed })
  } catch (error) {
    console.error("[landing-demo] Fout:", error)
    return NextResponse.json(
      { error: "Genereren mislukt. Probeer het later opnieuw." },
      { status: 500 },
    )
  }
}
