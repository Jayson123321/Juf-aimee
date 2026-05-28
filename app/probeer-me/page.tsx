"use client"

import { useEffect, useState, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import {
  ArrowRight,
  Check,
  Copy,
  Loader2,
  PenLine,
  RefreshCw,
  Send,
  Sparkles,
  Star,
  ThumbsUp,
  Lightbulb,
} from "lucide-react"
import { BackLink } from "@/components/BackLink"
import aimeePortrait from "@/app/Images/Aimee.png"

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

type Groep = (typeof GROEPEN)[number]
type Subject = (typeof SUBJECTS)[number]
type Level = (typeof LEVELS)[number]
type AssignmentType = (typeof TYPES)[number]
type Duration = (typeof DURATIONS)[number]
type Context = (typeof CONTEXTS)[number]
type Need = (typeof NEEDS)[number]

type AssignmentJSON = {
  title: string
  intro: string
  steps: string[]
  closer: string
}

function assignmentToText(a: AssignmentJSON) {
  return [
    `TITEL: ${a.title}`,
    "",
    "WAT GA JE DOEN?",
    a.intro,
    "",
    "AAN DE SLAG:",
    ...a.steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    "KLAAR?",
    a.closer,
  ].join("\n")
}

const TOPICS: Record<Subject, Partial<Record<Groep, string[]>>> = {
  Taal: {
    "Groep 3": ["Hakken en plakken", "Klanken herkennen", "Korte zinnen lezen", "Eerste schrijfletters"],
    "Groep 4": ["Vloeiend lezen", "Hoofdletters en punten", "Eenvoudig dictee", "Verhaaltje schrijven"],
    "Groep 5": ["Werkwoorden tegenwoordige tijd", "Lidwoorden", "Begrijpend lezen", "Zelf een verhaal schrijven"],
    "Groep 6": ["Werkwoordspelling", "Zinsbouw", "Begrijpend lezen", "Woordenschat"],
    "Groep 7": ["Werkwoordspelling verleden tijd", "Persoonsvorm", "Onderwerp en gezegde", "Verhaalopbouw"],
    "Groep 8": ["Lijdend voorwerp", "Tekst analyseren", "Argumenteren", "Spelling moeilijke woorden"],
  },
  Rekenen: {
    "Groep 3": ["Tellen tot 20", "Erbij en eraf", "Splitsen", "Klokkijken (heel uur)"],
    "Groep 4": ["Tafels 1-5", "Sommen tot 100", "Klokkijken (half uur)", "Geld rekenen"],
    "Groep 5": ["Vermenigvuldigen", "Delen", "Breuken", "Kommagetallen"],
    "Groep 6": ["Lange staartdeling", "Breuken vergelijken", "Procenten", "Oppervlakte"],
    "Groep 7": ["Procenten en kortingen", "Breuken vermenigvuldigen", "Inhoud", "Omtrek en oppervlakte"],
    "Groep 8": ["Verhoudingen", "Schaal", "Negatieve getallen", "Rekenen met procenten"],
  },
  Aardrijkskunde: {
    "Groep 3": ["Mijn buurt", "Plattegrond van de klas", "Weer en seizoenen"],
    "Groep 4": ["Nederland op de kaart", "Steden en dorpen", "Het weer"],
    "Groep 5": ["Provincies", "Landschappen", "Water in Nederland"],
    "Groep 6": ["Europa", "Hoofdsteden", "Klimaat"],
    "Groep 7": ["Continenten", "Landen en hoofdsteden", "Klimaatzones"],
    "Groep 8": ["Globalisering", "Bevolking en migratie", "Topografie wereld"],
  },
  Geschiedenis: {
    "Groep 3": ["Vroeger en nu", "Mijn familie", "Speelgoed van vroeger"],
    "Groep 4": ["Jagers en boeren", "Wonen vroeger", "Tijdlijn maken"],
    "Groep 5": ["Romeinen", "Middeleeuwen", "Ridders en kastelen"],
    "Groep 6": ["Vikingen", "Ontdekkingsreizen", "VOC tijd"],
    "Groep 7": ["Gouden Eeuw", "Industriële revolutie", "Eerste Wereldoorlog"],
    "Groep 8": ["Tweede Wereldoorlog", "Koude Oorlog", "Nederland na de oorlog"],
  },
  "Natuur & Techniek": {
    "Groep 3": ["Lichaamsdelen", "Planten in de tuin", "Zintuigen"],
    "Groep 4": ["Voortplanting planten", "Dieren in seizoenen", "Magneten"],
    "Groep 5": ["Het menselijk lichaam", "Elektrische stroom", "Drijven en zinken"],
    "Groep 6": ["Het skelet", "De waterkringloop", "Krachten"],
    "Groep 7": ["Energie", "Geluid en licht", "Voortplanting bij mensen"],
    "Groep 8": ["DNA en erfelijkheid", "Heelal en planeten", "Duurzaamheid"],
  },
  Engels: {
    "Groep 3": ["Colours", "Numbers 1-10", "Hello and goodbye"],
    "Groep 4": ["Body parts", "Animals", "Family members"],
    "Groep 5": ["Daily routines", "Weather", "Hobbies"],
    "Groep 6": ["Telling time", "Food and drinks", "School subjects"],
    "Groep 7": ["Past tense", "Describing people", "Travel vocabulary"],
    "Groep 8": ["Reading a short story", "Writing a letter", "Future tense"],
  },
}

const inputCls =
  "w-full px-4 py-3 bg-white rounded-2xl border-2 border-stone-900 font-semibold focus:outline-none focus:ring-4 focus:ring-orange-200 transition"

function Field({
  label,
  optional,
  children,
}: {
  label: string
  optional?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-black text-stone-900 mb-2">
        {label}
        {optional && <span className="ml-2 text-stone-400 font-bold">(optioneel)</span>}
      </label>
      {children}
    </div>
  )
}

const AIMEE_STAGES = [
  "Inspiratie zoeken bij {topic}…",
  "Stappen plannen voor {duration}…",
  "Concrete voorbeelden bedenken…",
  "Opdracht schrijven voor {groep}…",
  "Nog even nakijken voor je het ziet…",
]

const DID_YOU_KNOW = [
  "Hoe specifieker jouw onderwerp, hoe scherper de opdracht.",
  "Juf Aimee past de taal aan op het leesniveau van jouw groep.",
  "Bij rekenen krijg je echte sommen, niet alleen 'doe een vermenigvuldiging'.",
  "Elke opdracht is uniek — dezelfde input geeft toch elke keer iets anders.",
  "Klaar met je antwoord? Juf Aimee kijkt het na en geeft tips.",
]

function FloatingChip({
  children,
  rotation,
  delay,
  color,
  label,
}: {
  children: ReactNode
  rotation: number
  delay: number
  color: string
  label: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: rotation }}
      animate={{ opacity: 1, y: [0, -8, 0], rotate: rotation }}
      transition={{
        opacity: { delay, duration: 0.4 },
        rotate: { delay, duration: 0.4 },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
      }}
      className={`${color} border-4 border-stone-900 rounded-2xl px-4 py-3 shadow-[6px_6px_0px_0px_rgba(28,25,23,1)]`}
    >
      <div className="text-[10px] font-black uppercase tracking-wider opacity-70 mb-0.5">
        {label}
      </div>
      <div className="font-black text-stone-900 text-base leading-tight">{children}</div>
    </motion.div>
  )
}

function LoadingSidecar({
  groep,
  subject,
  topic,
  duration,
  loading,
}: {
  groep: string
  subject: string
  topic: string
  duration: string
  loading: boolean
}) {
  const [stageIdx, setStageIdx] = useState(0)
  const [factIdx, setFactIdx] = useState(0)

  useEffect(() => {
    if (!loading) {
      setStageIdx(AIMEE_STAGES.length)
      return
    }
    setStageIdx(0)
    const stageInterval = setInterval(() => {
      setStageIdx((i) => Math.min(i + 1, AIMEE_STAGES.length - 1))
    }, 3500)
    return () => clearInterval(stageInterval)
  }, [loading])

  useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIdx((i) => (i + 1) % DID_YOU_KNOW.length)
    }, 5000)
    return () => clearInterval(factInterval)
  }, [])

  const fillStage = (s: string) =>
    s
      .replace("{topic}", topic || "het onderwerp")
      .replace("{duration}", duration || "de gevraagde tijd")
      .replace("{groep}", groep || "deze groep")

  return (
    <>
      <div className="hidden lg:block fixed left-6 xl:left-16 top-32 w-56 z-10 space-y-3 pointer-events-none">
        <FloatingChip rotation={-3} delay={0} color="bg-pink-300" label="Groep">
          {groep}
        </FloatingChip>
        <FloatingChip rotation={3} delay={0.15} color="bg-sky-300" label="Vak">
          {subject}
        </FloatingChip>
        <FloatingChip rotation={-2} delay={0.3} color="bg-lime-300" label="Onderwerp">
          {topic}
        </FloatingChip>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white border-4 border-stone-900 rounded-2xl p-4 shadow-[6px_6px_0px_0px_rgba(28,25,23,1)]"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span className="font-black text-[10px] uppercase tracking-wider text-stone-500">
              Wist je dat?
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={factIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="text-sm text-stone-800 font-semibold leading-snug"
            >
              {DID_YOU_KNOW[factIdx]}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="hidden lg:block fixed right-6 xl:right-16 top-32 w-64 z-10 pointer-events-none">
        <div className="bg-white border-4 border-stone-900 rounded-2xl p-4 shadow-[6px_6px_0px_0px_rgba(28,25,23,1)]">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="font-black text-[10px] uppercase tracking-wider text-stone-500">
              {loading ? "Aimee is bezig" : "Aimee heeft gedaan"}
            </span>
          </div>
          <ol className="space-y-2.5">
            {AIMEE_STAGES.map((stage, i) => {
              const status = i < stageIdx ? "done" : i === stageIdx ? "active" : "pending"
              return (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span
                    className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 border-stone-900 flex items-center justify-center ${
                      status === "done"
                        ? "bg-lime-400"
                        : status === "active"
                          ? "bg-orange-500"
                          : "bg-white"
                    }`}
                  >
                    {status === "done" && <Check className="w-3 h-3 text-stone-900" />}
                    {status === "active" && (
                      <Loader2 className="w-3 h-3 text-white animate-spin" />
                    )}
                  </span>
                  <span
                    className={`font-semibold leading-snug ${
                      status === "active"
                        ? "text-stone-900"
                        : status === "done"
                          ? "text-stone-500 line-through decoration-2"
                          : "text-stone-400"
                    }`}
                  >
                    {fillStage(stage)}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </>
  )
}

function AimeeMascot({ message, celebrate }: { message: string; celebrate?: boolean }) {
  return (
    <div className="flex items-center gap-4 mt-5">
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [-3, 3, -3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex-shrink-0"
      >
        <div
          className="absolute inset-0 bg-amber-300 rounded-full -rotate-6 scale-110"
          aria-hidden
        />
        <div className="relative w-20 h-20 md:w-24 md:h-24 overflow-hidden rounded-full border-4 border-stone-900 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
          <Image
            src={aimeePortrait}
            alt="Juf Aimee"
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
        {celebrate && (
          <motion.div
            animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2 text-orange-500"
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
        )}
      </motion.div>
      <motion.div
        key={message}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 bg-white border-2 border-stone-900 rounded-2xl rounded-bl-sm px-4 py-3 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]"
      >
        <p className="text-sm md:text-base font-semibold text-stone-800 leading-relaxed">
          {message}
        </p>
      </motion.div>
    </div>
  )
}

type FeedbackJSON = {
  verdict: "correct" | "partial" | "incorrect"
  feedback: string
  hints: string[]
}

const VERDICT_STYLES: Record<
  FeedbackJSON["verdict"],
  { label: string; bg: string; text: string; ring: string }
> = {
  correct: {
    label: "Goed gedaan!",
    bg: "from-lime-200 to-emerald-200",
    text: "text-emerald-900",
    ring: "border-emerald-600",
  },
  partial: {
    label: "Bijna!",
    bg: "from-amber-100 to-orange-200",
    text: "text-orange-900",
    ring: "border-orange-500",
  },
  incorrect: {
    label: "Nog niet helemaal",
    bg: "from-rose-100 to-pink-200",
    text: "text-rose-900",
    ring: "border-rose-500",
  },
}

function AnswerBox({ assignment }: { assignment: AssignmentJSON }) {
  const [answer, setAnswer] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackJSON | null>(null)
  const [error, setError] = useState("")

  async function submit() {
    setError("")
    setVerifying(true)
    try {
      const res = await fetch("/api/landing-demo/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignment, answer }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Beoordelen mislukt.")
      setFeedback(data.feedback as FeedbackJSON)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Er ging iets mis.")
    } finally {
      setVerifying(false)
    }
  }

  function tryAgain() {
    setFeedback(null)
    setError("")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-6 bg-white border-4 border-stone-900 rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(28,25,23,1)]"
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <PenLine className="w-5 h-5 text-orange-500" />
          <span className="font-black text-stone-900 text-lg">
            {feedback ? "Jouw antwoord" : "Schrijf hier je antwoord"}
          </span>
        </div>
        {feedback && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-900 text-amber-300 rounded-full text-xs font-bold">
            <Check className="w-3 h-3" /> Verstuurd
          </span>
        )}
      </div>

      <div className="relative bg-amber-50 rounded-2xl border-2 border-dashed border-amber-400 p-4 overflow-hidden">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 27px, #fbbf24 27px, #fbbf24 28px)",
          }}
          aria-hidden
        />
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Begin hier met schrijven…"
          rows={6}
          maxLength={2000}
          disabled={verifying}
          readOnly={!!feedback}
          className="relative w-full bg-transparent resize-none focus:outline-none text-stone-800 font-semibold placeholder:text-stone-400 disabled:opacity-60 read-only:cursor-default"
          style={{ lineHeight: "28px" }}
        />
      </div>

      {error && !feedback && (
        <div className="mt-3 bg-red-50 border-2 border-red-300 rounded-2xl px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {!feedback && (
        <button
          onClick={submit}
          disabled={!answer.trim() || verifying}
          className="mt-4 px-5 py-3 bg-orange-500 text-white rounded-2xl border-2 border-stone-900 font-bold hover:bg-stone-900 hover:text-amber-300 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {verifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Juf Aimee kijkt na…</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Verzend antwoord</span>
            </>
          )}
        </button>
      )}

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-5 bg-gradient-to-br ${VERDICT_STYLES[feedback.verdict].bg} border-2 ${VERDICT_STYLES[feedback.verdict].ring} rounded-2xl p-5 md:p-6`}
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              animate={
                feedback.verdict === "correct"
                  ? { rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }
                  : { rotate: [0, -8, 8, 0] }
              }
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className={VERDICT_STYLES[feedback.verdict].text}
            >
              {feedback.verdict === "correct" ? (
                <Star className="w-8 h-8 fill-current" />
              ) : (
                <ThumbsUp className="w-8 h-8" />
              )}
            </motion.div>
            <p
              className={`font-black text-xl ${VERDICT_STYLES[feedback.verdict].text}`}
            >
              {VERDICT_STYLES[feedback.verdict].label}
            </p>
          </div>

          <p
            className={`text-sm md:text-base font-semibold leading-relaxed ${VERDICT_STYLES[feedback.verdict].text} mb-4`}
          >
            {feedback.feedback}
          </p>

          {feedback.hints.length > 0 && (
            <div className="bg-white/70 rounded-2xl border-2 border-stone-900 p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span className="font-black text-stone-900 text-sm uppercase tracking-wide">
                  Tips van Juf Aimee
                </span>
              </div>
              <ul className="space-y-2">
                {feedback.hints.map((h, i) => (
                  <li key={i} className="flex gap-2 text-sm text-stone-800 font-semibold">
                    <span className="text-orange-500 font-black">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={tryAgain}
              className="px-5 py-2 bg-white rounded-2xl border-2 border-stone-900 font-bold text-sm hover:bg-amber-100 transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Pas antwoord aan</span>
            </button>
            <Link
              href="/register"
              className="px-5 py-2 bg-stone-900 text-amber-300 rounded-2xl border-2 border-stone-900 font-bold text-sm hover:bg-orange-500 hover:text-stone-900 transition flex items-center gap-2"
            >
              <span>Meer met Juf Aimee</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function ProbeerMePage() {
  const [groep, setGroep] = useState<Groep | "">("")
  const [subject, setSubject] = useState<Subject | "">("")
  const [topic, setTopic] = useState("")
  const [level, setLevel] = useState<Level>("Average")
  const [type, setType] = useState<AssignmentType | "">("")
  const [objective, setObjective] = useState("")
  const [duration, setDuration] = useState<Duration | "">("")
  const [context, setContext] = useState<Context>("Introduction to new topic")
  const [needs, setNeeds] = useState<Need[]>([])
  const [notes, setNotes] = useState("")

  const [loading, setLoading] = useState(false)
  const [assignment, setAssignment] = useState<AssignmentJSON | null>(null)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const suggestions = subject && groep ? TOPICS[subject]?.[groep] ?? [] : []

  const canGenerate =
    !!groep && !!subject && !!topic.trim() && !!type && !!duration && !loading

  function toggleNeed(n: Need) {
    setNeeds((prev) => {
      if (n === "None") return prev.includes("None") ? [] : ["None"]
      const without = prev.filter((p) => p !== "None")
      return without.includes(n) ? without.filter((p) => p !== n) : [...without, n]
    })
  }

  async function generate() {
    setError("")
    setAssignment(null)
    setLoading(true)
    try {
      const res = await fetch("/api/landing-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groep,
          subject,
          topic,
          level,
          type,
          objective,
          duration,
          context,
          needs,
          notes,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Genereren mislukt.")
      setAssignment(data.assignment as AssignmentJSON)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Er ging iets mis.")
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setAssignment(null)
    setError("")
    setCopied(false)
  }

  async function copy() {
    if (!assignment) return
    await navigator.clipboard.writeText(assignmentToText(assignment))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {(loading || !!assignment) && (
        <LoadingSidecar
          groep={groep}
          subject={subject}
          topic={topic}
          duration={duration}
          loading={loading}
        />
      )}
      <div className="mx-auto max-w-3xl px-6 pt-4 pb-16">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <BackLink href="/" label="" />
            <h1 className="display-font text-4xl md:text-5xl font-black leading-tight">
              {assignment ? (
                <>
                  Hier is{" "}
                  <span className="bg-lime-300 px-2 inline-block -rotate-1 border-2 border-stone-900 rounded-xl">
                    jouw opdracht
                  </span>
                  !
                </>
              ) : (
                <>
                  Maak een{" "}
                  <span className="bg-amber-300 px-2 inline-block -rotate-1 border-2 border-stone-900 rounded-xl">
                    opdracht
                  </span>{" "}
                  <span className="text-orange-500">op maat</span>
                </>
              )}
            </h1>
          </div>
          <AimeeMascot
            celebrate={!!assignment}
            message={
              assignment
                ? "Tadaa! Ik heb een opdracht voor je gemaakt. Lees 'm rustig door en schrijf je antwoord hieronder — ik kijk vast even mee."
                : loading
                  ? "Ik ben hard aan het werk… nog een momentje, ik schrijf je opdracht!"
                  : "Vul de velden in en ik maak een opdracht speciaal voor jou. Hoe specifieker, hoe beter!"
            }
          />
        </div>

        {!assignment && (
          <div className="bg-white border-4 border-stone-900 rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(28,25,23,1)] space-y-6">
            <Field label="1. Groep">
              <select
                value={groep}
                onChange={(e) => {
                  setGroep(e.target.value as Groep)
                  setTopic("")
                }}
                className={inputCls}
              >
                <option value="">Kies een groep…</option>
                {GROEPEN.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="2. Vak">
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value as Subject)
                  setTopic("")
                }}
                className={inputCls}
              >
                <option value="">Kies een vak…</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>

            <AnimatePresence initial={false}>
              {subject && (
                <motion.div
                  key="topic"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <Field label="3. Onderwerp">
                    {suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {suggestions.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setTopic(s)}
                            className={`px-3 py-1 rounded-full border-2 border-stone-900 text-sm font-bold transition ${
                              topic === s
                                ? "bg-stone-900 text-amber-300"
                                : "bg-white hover:bg-amber-100"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder={
                        suggestions.length > 0
                          ? "Of typ je eigen onderwerp…"
                          : "Typ een onderwerp…"
                      }
                      maxLength={80}
                      className={inputCls}
                    />
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>

            <Field label="4. Niveau van de leerling">
              <div className="flex flex-wrap gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLevel(l)}
                    className={`px-4 py-2 rounded-2xl border-2 border-stone-900 text-sm font-bold transition ${
                      level === l ? "bg-orange-500 text-white" : "bg-white hover:bg-orange-100"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="5. Type opdracht">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AssignmentType)}
                className={inputCls}
              >
                <option value="">Kies type…</option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="6. Leerdoel" optional>
              <input
                type="text"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Wat moet de leerling na deze opdracht kunnen?"
                maxLength={200}
                className={inputCls}
              />
            </Field>

            <Field label="7. Tijdsduur">
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value as Duration)}
                className={inputCls}
              >
                <option value="">Kies tijdsduur…</option>
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="8. Context">
              <div className="flex flex-wrap gap-2">
                {CONTEXTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setContext(c)}
                    className={`px-4 py-2 rounded-2xl border-2 border-stone-900 text-sm font-bold transition ${
                      context === c ? "bg-sky-400 text-stone-900" : "bg-white hover:bg-sky-100"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="9. Bijzonderheden" optional>
              <div className="flex flex-wrap gap-2">
                {NEEDS.map((n) => {
                  const active = needs.includes(n)
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => toggleNeed(n)}
                      className={`px-4 py-2 rounded-2xl border-2 border-stone-900 text-sm font-bold transition ${
                        active ? "bg-lime-400 text-stone-900" : "bg-white hover:bg-lime-100"
                      }`}
                    >
                      {active ? "✓ " : ""}
                      {n}
                    </button>
                  )
                })}
              </div>
            </Field>

            <Field label="10. Extra notities" optional>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Aanvullende info, voorkeuren of context…"
                rows={3}
                maxLength={300}
                className={inputCls}
              />
            </Field>

            {error && (
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={generate}
              disabled={!canGenerate}
              className="w-full px-7 py-4 bg-orange-500 text-white rounded-2xl font-bold text-lg border-4 border-stone-900 shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Juf Aimee schrijft je opdracht…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Genereer opdracht</span>
                </>
              )}
            </button>
          </div>
        )}

        {assignment && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-4 border-stone-900 rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(28,25,23,1)]"
            >
            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-orange-600">
              <Sparkles className="w-4 h-4" /> <span>Opdracht door Juf Aimee</span>
            </div>

            <h2 className="display-font text-3xl font-black text-stone-900 mb-5 leading-tight">
              {assignment.title}
            </h2>

            <div className="mb-5">
              <div className="text-xs font-black uppercase tracking-wide text-stone-500 mb-1">
                Wat ga je doen?
              </div>
              <p className="text-stone-800 leading-relaxed">{assignment.intro}</p>
            </div>

            <div className="mb-5">
              <div className="text-xs font-black uppercase tracking-wide text-stone-500 mb-2">
                Aan de slag
              </div>
              <ol className="space-y-2 text-stone-800">
                {assignment.steps.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 bg-orange-500 text-white rounded-full border-2 border-stone-900 font-bold text-xs">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed whitespace-pre-wrap">{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-amber-50 border-2 border-dashed border-amber-400 rounded-2xl p-4">
              <div className="text-xs font-black uppercase tracking-wide text-stone-500 mb-1">
                Klaar?
              </div>
              <p className="text-stone-800 font-semibold">{assignment.closer}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={copy}
                className="px-5 py-3 bg-stone-900 text-amber-300 rounded-2xl border-2 border-stone-900 font-bold hover:bg-orange-500 hover:text-stone-900 transition flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Gekopieerd!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Kopieer</span>
                  </>
                )}
              </button>
              <button
                onClick={reset}
                className="px-5 py-3 bg-white rounded-2xl border-2 border-stone-900 font-bold hover:bg-amber-100 transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Nieuwe opdracht
              </button>
            </div>
            </motion.div>
            <AnswerBox assignment={assignment} />
          </>
        )}
      </div>
    </div>
  )
}
