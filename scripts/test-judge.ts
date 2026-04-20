import { evalueerOpdracht } from "../lib/judge"
import "dotenv/config"

const OPDRACHT = `
Ontwerp jouw eigen stad van de toekomst

Noah, jij bent aangesteld als stadsarchitect van een nieuwe stad die gebouwd wordt op een plek naar jouw keuze op aarde. Jij bepaalt alles — maar je moet je keuzes wetenschappelijk onderbouwen.

Stap 1 — Kies je locatie
Kies een locatie op aarde voor jouw nieuwe stad. Denk na over:
- Wat is het klimaat daar?
- Welke natuurlijke hulpbronnen zijn beschikbaar?
- Welke gevaren zijn er (overstromingen, aardbevingen, hitte)?

Stap 2 — Ontwerp de stad
Teken of beschrijf een plattegrond van jouw stad. Verwerk hierin:
- Hoe zorg je voor drinkwater?
- Hoe wek je energie op?
- Waar wonen mensen, waar werken ze, waar is natuur?

Stap 3 — Verdedig je keuzes
Schrijf een korte presentatie (of notities) waarin je uitlegt waarom jouw stad op deze plek gebouwd is en hoe jouw ontwerp past bij het klimaat en de omgeving.

Eindproduct: een ontwerp (tekening/schema) + een onderbouwing van minimaal 10 zinnen.
`.trim()

async function testJudge() {
  const input = {
    naam: "Noah Smit",
    leeftijd: "11 jaar",
    interesses: "onderzoeken, strategie",
    bloomNiveau: "Creëren",
    vak: "Aardrijkskunde",
    beginsituatie:
      "Noah is een hoogbegaafde leerling die zelfstandig werkt en uitgedaagd wil worden met complexe, open opdrachten.",
    gegenereerdeOpdracht: OPDRACHT,
  }

  console.log("=== Judge test gestart ===\n")
  console.log(`Leerling:   ${input.naam} (${input.leeftijd})`)
  console.log(`Bloom:      ${input.bloomNiveau}`)
  console.log(`Vak:        ${input.vak}\n`)
  console.log("Bezig met beoordelen (9 criteria parallel, duurt 2-5 minuten)...\n")

  const result = await evalueerOpdracht(input, 1)

  console.log("=== Resultaat ===")
  console.log(`Totaalscore:    ${result.totaalScore}/${result.maxScore}`)
  console.log(`Genormaliseerd: ${(result.genormaliseerdeScore * 100).toFixed(1)}%`)
  console.log(`Beslissing:     ${result.beslissing}`)

  console.log("\n=== Scores per criterium ===")
  for (const s of result.scores) {
    console.log(`C${s.criterium}: ${s.score}/5 — ${s.naam}`)
    console.log(`   ${s.feedback}\n`)
  }
}

testJudge().catch(console.error)
