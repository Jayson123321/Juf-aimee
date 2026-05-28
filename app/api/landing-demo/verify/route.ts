import { NextRequest, NextResponse } from "next/server"
import { ollama, GEN_MODEL } from "@/lib/ollama"

const FEEDBACK_SCHEMA = {
  type: "object",
  properties: {
    verdict: { type: "string", enum: ["correct", "partial", "incorrect"] },
    feedback: { type: "string" },
    hints: { type: "array", items: { type: "string" } },
  },
  required: ["verdict", "feedback", "hints"],
} as const

type FeedbackJSON = {
  verdict: "correct" | "partial" | "incorrect"
  feedback: string
  hints: string[]
}

const rateLimit = new Map<string, number[]>()
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 8

function clean(s: unknown, max: number) {
  if (typeof s !== "string") return ""
  return s.trim().slice(0, max)
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

  const assignment = body.assignment as {
    title?: unknown
    intro?: unknown
    steps?: unknown
  } | null

  const title = clean(assignment?.title, 200)
  const intro = clean(assignment?.intro, 600)
  const steps = Array.isArray(assignment?.steps)
    ? assignment.steps.map((s) => clean(s, 600)).filter(Boolean)
    : []
  const answer = clean(body.answer, 2000)

  if (!title || !intro || steps.length === 0) {
    return NextResponse.json({ error: "Opdracht ontbreekt." }, { status: 400 })
  }
  if (!answer) {
    return NextResponse.json({ error: "Antwoord is leeg." }, { status: 400 })
  }

  const systemPrompt = `Je bent Juf Aimee, een warme en eerlijke AI-leraar voor de basisschool. Je beoordeelt het antwoord van een leerling op een opdracht.

Regels:
- Lees de OPDRACHT zorgvuldig en bepaal welke vragen of stappen een antwoord vereisen.
- Vergelijk het ANTWOORD met wat verwacht wordt. Wees inhoudelijk eerlijk.
- "correct" = alle hoofdvragen zijn inhoudelijk goed beantwoord
- "partial" = goede poging, maar belangrijke onderdelen missen of zijn fout
- "incorrect" = grotendeels fout of niet aansluitend op de opdracht
- Schrijf feedback DIRECT aan de leerling met "jij"/"je". Warm, opbouwend, eerlijk.
- Geef in "hints" 1-3 concrete tips die de leerling helpen om het beter te doen — geen complete antwoorden, wel richting.`

  const stepsBlock = steps.map((s, i) => `${i + 1}. ${s}`).join("\n")
  const userPrompt = `OPDRACHT
Titel: ${title}
Instructie: ${intro}
Stappen:
${stepsBlock}

ANTWOORD VAN DE LEERLING
${answer}

Geef terug als geldig JSON:
- "verdict": "correct" | "partial" | "incorrect"
- "feedback": 2-3 zinnen, direct aan de leerling
- "hints": array met 1-3 concrete tips (lege array als verdict "correct" is)

Antwoord ALLEEN met geldig JSON. Geen markdown, geen extra tekst.`

  console.log("\n========== [landing-demo/verify] PROMPT ==========")
  console.log(userPrompt)
  console.log("===================================================\n")

  try {
    const startedAt = Date.now()
    const res = await ollama.chat({
      model: GEN_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      format: FEEDBACK_SCHEMA,
      options: { temperature: 0.4 },
    })
    const raw = res.message.content?.trim() ?? ""
    console.log(`\n========== [landing-demo/verify] RESPONSE (${Date.now() - startedAt}ms) ==========`)
    console.log(raw)
    console.log("=========================================================================\n")

    let parsed: FeedbackJSON
    try {
      parsed = JSON.parse(raw)
    } catch {
      return NextResponse.json(
        { error: "Ongeldig antwoord van model. Probeer opnieuw." },
        { status: 502 },
      )
    }
    if (
      (parsed.verdict !== "correct" &&
        parsed.verdict !== "partial" &&
        parsed.verdict !== "incorrect") ||
      typeof parsed.feedback !== "string" ||
      !Array.isArray(parsed.hints)
    ) {
      return NextResponse.json(
        { error: "Incompleet antwoord van model. Probeer opnieuw." },
        { status: 502 },
      )
    }
    return NextResponse.json({ feedback: parsed })
  } catch (error) {
    console.error("[landing-demo/verify] Fout:", error)
    return NextResponse.json(
      { error: "Beoordelen mislukt. Probeer het later opnieuw." },
      { status: 500 },
    )
  }
}
