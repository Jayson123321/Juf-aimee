import { evalueerOpdrachtStreaming, JudgeResult } from "../lib/judge"
import { zoekVolledigProfiel, zoekBeginsituatie } from "../app/ai/tools/search_opp"
import { getStudentAge } from "../lib/student-profile"
import { prisma } from "../lib/db"
import { writeFileSync } from "fs"
import "dotenv/config"

// Gebruik: npx tsx scripts/test-judge.ts <studentId>
// Voorbeeld: npx tsx scripts/test-judge.ts clxyz123
const studentId = process.argv[2]

if (!studentId) {
  console.error("Gebruik: npx tsx scripts/test-judge.ts <studentId>")
  process.exit(1)
}

const SLECHTE_OPDRACHT = `
Titel: Landen kleuren

Kleur de landen van Europa in op de kaart. Gebruik verschillende kleuren.
Schrijf bij elk land de hoofdstad op. Maak het mooi en netjes. Zorg dat je
binnen de lijnen kleurt.
`.trim()

const GOEDE_OPDRACHT = `
Titel: Ontwerp je eigen weersysteem-experiment

Noah, jij wordt klimaatwetenschapper. Kies één klimaatzone op aarde (bijv.
woestijn, tropisch regenwoud of toendra) en doe onderzoek naar waarom het
daar zo regent — of juist niet.

Stap 1 — Formuleer een hypothese
Bedenk een verklaring: waarom valt er in jouw gekozen klimaatzone zo veel of
zo weinig neerslag? Schrijf dit op als een echte wetenschappelijke hypothese
("Ik denk dat... omdat...").

Stap 2 — Test je hypothese met data
Zoek klimaatdata op (temperatuur, neerslag, wind) van jouw zone. Vergelijk
minstens twee maanden met elkaar. Klopt jouw hypothese? Pas hem aan als dat
nodig is.

Stap 3 — Ontwerp een experiment
Beschrijf een experiment dat je in de klas zou kunnen uitvoeren om één aspect
van jouw klimaatzone na te bootsen (bijv. verdamping, condensatie,
regenschaduw). Wat heb je nodig? Wat meet je? Wat verwacht je te zien?

Eindproduct: een onderzoeksverslag met hypothese, data-analyse en
experimentontwerp.
`.trim()

// bloomNiveau staat in de DB op null voor deze leerling. Voor de judge
// geven we het gewenste niveau expliciet mee.
const BLOOM_OVERRIDE = "Creëren"

function extractInterests(sources: string[]): string {
  const snippets = new Set<string>()
  const patterns = [
    /[^.\n]{0,80}interesse[^.\n]{0,140}[.\n]?/gi,
    /[^.\n]{0,80}nieuwsgierig[^.\n]{0,140}[.\n]?/gi,
  ]
  for (const source of sources) {
    for (const pattern of patterns) {
      for (const raw of source.match(pattern) ?? []) {
        const cleaned = raw.replace(/\s+/g, " ").trim()
        if (cleaned.length >= 12) snippets.add(cleaned)
      }
    }
  }
  const found = [...snippets].slice(0, 3)
  return found.length > 0 ? found.join("; ") : "Niet expliciet benoemd in OPP"
}

const lines: string[] = []
function out(line = "") {
  console.log(line)
  lines.push(line)
}

async function testOpdracht(
  label: string,
  opdracht: string,
  judgeInput: Omit<Parameters<typeof evalueerOpdrachtStreaming>[0], "gegenereerdeOpdracht">,
): Promise<JudgeResult> {
  out(`\n${"=".repeat(60)}`)
  out(`  ${label}`)
  out("=".repeat(60))
  out()
  out(opdracht)
  out()
  console.log("Bezig met beoordelen...\n")

  const result = await evalueerOpdrachtStreaming(
    { ...judgeInput, gegenereerdeOpdracht: opdracht },
    (stap) => {
      const korteFeedback = stap.feedback.length > 160
        ? stap.feedback.slice(0, 157) + "..."
        : stap.feedback
      out(`C${stap.criterium}: ${stap.score}/5  ${stap.naam}`)
      out(`   → ${korteFeedback}`)
      out()
    },
    1,
  )

  out(`UITSLAG: ${result.totaalScore}/${result.maxScore} (${(result.genormaliseerdeScore * 100).toFixed(1)}%) → ${result.beslissing.toUpperCase()}`)

  return result
}

async function testJudge() {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { profile: { select: { currentSchoolYearGroup: true } } },
  })

  if (!student) {
    console.error(`Student '${studentId}' niet gevonden in de database.`)
    process.exit(1)
  }

  console.log("OPP ophalen...")
  const sources = await zoekVolledigProfiel(student.id, "Aardrijkskunde")
  const beginsituatieBronnen = await zoekBeginsituatie(student.id)
  const beginsituatie = beginsituatieBronnen.join("\n\n").slice(0, 800) || "Geen OPP beschikbaar."
  const leeftijd = getStudentAge(student.dateOfBirth)
  const leeftijdLabel = leeftijd ? `${leeftijd} jaar` : "onbekend"
  const interessesLabel = extractInterests(sources)

  out("=".repeat(60))
  out("  JUDGE TESTRAPPORT — NOAH SMIT")
  out("=".repeat(60))
  out(`Leerling:   ${student.fullName} | Groep ${student.profile?.currentSchoolYearGroup ?? student.groep}`)
  out(`Leeftijd:   ${leeftijdLabel} | Bloom: ${BLOOM_OVERRIDE}`)
  out(`Interesses: ${interessesLabel}`)
  out(`OPP-bronnen: ${sources.length} chunks geladen`)

  const judgeInput = {
    naam: student.fullName,
    leeftijd: leeftijdLabel,
    interesses: interessesLabel,
    bloomNiveau: BLOOM_OVERRIDE,
    vak: "Aardrijkskunde",
    beginsituatie,
    volledigOpp: sources.join("\n\n---\n\n"),
  }

  const slecht = await testOpdracht("SLECHTE OPDRACHT — Landen kleuren", SLECHTE_OPDRACHT, judgeInput)
  const goed = await testOpdracht("GOEDE OPDRACHT — Ontwerp je eigen weersysteem-experiment", GOEDE_OPDRACHT, judgeInput)

  out(`\n${"=".repeat(60)}`)
  out("  VERGELIJKING")
  out("=".repeat(60))
  out(`${"Criterium".padEnd(10)} ${"Slecht".padEnd(8)} ${"Goed".padEnd(8)} Verschil`)
  out("-".repeat(40))
  for (let i = 0; i < slecht.scores.length; i++) {
    const s = slecht.scores[i]
    const g = goed.scores[i]
    const diff = g.score - s.score
    const pijl = diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : "="
    out(`C${String(i + 1).padEnd(9)} ${String(s.score + "/5").padEnd(8)} ${String(g.score + "/5").padEnd(8)} ${pijl}`)
  }
  out("-".repeat(40))
  out(`${"Totaal".padEnd(10)} ${String(slecht.totaalScore + "/40").padEnd(8)} ${String(goed.totaalScore + "/40").padEnd(8)}`)
  out(`${"Score".padEnd(10)} ${(slecht.genormaliseerdeScore * 100).toFixed(1).padEnd(7)}% ${(goed.genormaliseerdeScore * 100).toFixed(1)}%`)
  out(`${"Beslissing".padEnd(10)} ${slecht.beslissing.padEnd(8)} ${goed.beslissing}`)

  // Rapport opslaan
  const rapport = lines.join("\n")
  const pad = `docs/judge-testrapport-${new Date().toISOString().slice(0, 10)}.txt`
  writeFileSync(pad, rapport, "utf-8")
  console.log(`\nRapport opgeslagen: ${pad}`)

  await prisma.$disconnect()
}

testJudge().catch(console.error)
