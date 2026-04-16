import { ollama, JUDGE_MODEL } from "@/lib/ollama"

type CriteriumRubric = {
  naam: string
  scores: Record<number, string>
}

export type CriteriumScore = {
  criterium: number
  naam: string
  feedback: string
  score: number
}

export type JudgeInput = {
  naam: string
  leeftijd: string
  interesses: string
  bloomNiveau: string
  vak: string
  beginsituatie: string
  gegenereerdeOpdracht: string
}

export type JudgeBeslissing = "goedkeuren" | "flaggen" | "opnieuw_genereren" | "escaleren"

export type JudgeResult = {
  scores: CriteriumScore[]
  totaalScore: number
  maxScore: number
  genormaliseerdeScore: number
  beslissing: JudgeBeslissing
}

const CRITERIA: CriteriumRubric[] = [
  {
    naam: "Bevat de opdracht elementen die aansluiten op de interesses die in het leerlingprofiel staan?",
    scores: {
      1: "Geen enkele aansluiting op de interesses van de leerling",
      2: "Vaag verband, nauwelijks specifiek",
      3: "Enkele elementen herkenbaar",
      4: "Meeste interesses goed verwerkt",
      5: "Volledig afgestemd op de interesses van de leerling",
    },
  },
  {
    naam: "Past de moeilijkheidsgraad van de opdracht bij het opgegeven Bloom-niveau van de leerling?",
    scores: {
      1: "Verkeerd Bloom-niveau, geen match",
      2: "Niveau is te hoog of te laag",
      3: "Globaal passend niveau",
      4: "Goed afgestemd, kleine afwijking",
      5: "Exact juist Bloom-niveau",
    },
  },
  {
    naam: "Kan een leerling van deze leeftijd en dit niveau de opdracht zelfstandig uitvoeren?",
    scores: {
      1: "Onhaalbaar, te complex of te vaag",
      2: "Lastig uitvoerbaar zonder hulp",
      3: "Haalbaar met enige ondersteuning",
      4: "Zelfstandig uitvoerbaar",
      5: "Uitdagend én volledig haalbaar",
    },
  },
  {
    naam: "Sluit de opdracht aan bij de beginsituatie van de leerling zoals beschreven in het OPP-profiel?",
    scores: {
      1: "Geen aansluiting op beginsituatie",
      2: "Weinig aansluiting",
      3: "Gedeeltelijke aansluiting",
      4: "Goede aansluiting",
      5: "Volledig afgestemd op beginsituatie",
    },
  },
  {
    naam: "Is de opdracht leeftijdspassend in taalgebruik, toon en inhoud voor dit kind?",
    scores: {
      1: "Niet leeftijdspassend",
      2: "Twijfelachtig, risico aanwezig",
      3: "Voldoende leeftijdspassend",
      4: "Goed leeftijdspassend",
      5: "Volledig leeftijdspassend en motiverend",
    },
  },
  {
    naam: "Bevat de opdracht geen aannames of stereotypes op basis van geslacht, cultuur of achtergrond?",
    scores: {
      1: "Duidelijke stereotypes aanwezig",
      2: "Subtiele aannames aanwezig",
      3: "Neutraal",
      4: "Inclusief",
      5: "Volledig inclusief en divers",
    },
  },
  {
    naam: "Kan een leerkracht de opdracht makkelijk lezen, beoordelen en indien nodig aanpassen?",
    scores: {
      1: "Onbegrijpelijk voor leerkracht",
      2: "Moeilijk te beoordelen",
      3: "Begrijpelijk maar niet makkelijk aan te passen",
      4: "Goed leesbaar en aanpasbaar",
      5: "Volledig transparant en eenvoudig aan te passen",
    },
  },
  {
    naam: "Zijn alle elementen in de opdracht terug te herleiden naar het leerlingprofiel, zonder verzonnen info?",
    scores: {
      1: "Veel verzonnen informatie",
      2: "Enkele verzonnen elementen",
      3: "Grotendeels correct",
      4: "Vrijwel volledig correct",
      5: "Volledig gebaseerd op leerlingprofiel",
    },
  },
  {
    naam: "Gebruikt de opdracht alleen relevante leerlinginfo en laat het irrelevante details weg?",
    scores: {
      1: "Veel irrelevante informatie gebruikt",
      2: "Enkele irrelevante elementen",
      3: "Redelijk gefocust",
      4: "Goed gefocust",
      5: "Alleen relevante informatie gebruikt",
    },
  },
]

function buildJudgePrompt(input: JudgeInput, criteriumIndex: number): string {
  const criterium = CRITERIA[criteriumIndex]
  const rubricLines = Object.entries(criterium.scores)
    .map(([score, desc]) => `Score ${score}: ${desc}`)
    .join("\n")

  return `###Task Description:
Je bent een gespecialiseerd beoordelaar met diepgaande expertise in hoogbegaafdheidsonderwijs op de basisschool. Jouw taak is om een verrijkingsopdracht te beoordelen vanuit het belang van deze specifieke hoogbegaafde leerling.

Belangrijk kader voor jouw beoordeling:
- Hoogbegaafde leerlingen hebben juist behoefte aan complexe, open en uitdagende taken. Een opdracht die "te makkelijk" is, is slechter voor hun ontwikkeling dan een opdracht die uitdagend is.
- Bij Bloom-niveau "Creëren" horen taken waarbij de leerling zelf ontwerpt, synthetiseert en keuzes maakt op basis van eigen redenering. Dat is per definitie complex en open — dit is géén tekortkoming.
- Zelfstandig werken betekent voor een hoogbegaafde leerling: zonder continue sturing van de leerkracht, met eigen initiatief. Het is normaal en wenselijk dat de leerling daarvoor bronnen raadpleegt of creatieve keuzes maakt.
- Beoordeel altijd vanuit de vraag: "Is dit goed voor de ontwikkeling van dit specifieke hoogbegaafde kind?" Leg in je feedback uit waarom de opdracht wel of niet aansluit op zijn behoeften en niveau.

An instruction (might include an Input inside it), a response to evaluate, and a score rubric representing a evaluation criteria are given.
1. Write a detailed feedback that assess the quality of the response strictly based on the given score rubric, not evaluating in general.
2. After writing a feedback, write a score that is an integer between 1 and 5. You should refer to the score rubric.
3. The output format should look as follows: "Feedback: (write a feedback for criteria) [RESULT] (an integer number between 1 and 5)"
4. Please do not generate any other opening, closing, and explanations.
5. Write your feedback ONLY in Dutch. Schrijf NOOIT in het Engels.
6. Gebruik uitsluitend informatie die letterlijk in de invoer hieronder staat (Naam, Leeftijd, Interesses, Bloom-niveau, Vak, Beginsituatie en Response). Verzín geen extra interesses, geen extra context en geen alternatieve leerlinggegevens.
7. Als iets ontbreekt in de invoer, benoem dat als "ontbreekt in de aangeleverde context" in plaats van te speculeren.
8. Voor C9 geldt: relevante leerlinginfo (zoals leeftijd, Bloom-niveau, interesses en beginsituatie) is juist relevant en mag niet als irrelevante detail worden afgekeurd.
9. Redeneer in je feedback altijd expliciet vanuit het belang van dit hoogbegaafde kind: leg uit waarom de opdracht wél of níet goed aansluit op zijn ontwikkeling, behoeften en niveau.

###The instruction to evaluate:
Genereer een verrijkingsopdracht voor een hoogbegaafde leerling met de volgende kenmerken:

Naam: ${input.naam}
Leeftijd: ${input.leeftijd}
Interesses: ${input.interesses}
Bloom-niveau: ${input.bloomNiveau}
Vak: ${input.vak}
Beginsituatie: ${input.beginsituatie}

De opdracht moet aansluiten op bovenstaande kenmerken.

Let op: gebruik de leeftijd die hieronder staat expliciet in je beoordeling. Als de leeftijd bekend is, oordeel dan niet alsof die onbekend is en verzin geen alternatieve leeftijd.
Let op: dit gaat expliciet om deze specifieke hoogbegaafde leerling; beoordeel niet alsof het een algemene of gemiddelde leerling is.

###Response to evaluate:
${input.gegenereerdeOpdracht}

###Score Rubrics:
[Criterium ${criteriumIndex + 1}] ${criterium.naam}
${rubricLines}

###Feedback:`
}

function parseJudgeResponse(response: string): { feedback: string; score: number } {
  const match = response.match(/Feedback:\s*([\s\S]*?)\[RESULT\]\s*([1-5])/)
  if (match) {
    return {
      feedback: match[1].trim(),
      score: parseInt(match[2]),
    }
  }

  // Fallback: zoek [RESULT] zonder "Feedback:" prefix
  const resultOnlyMatch = response.match(/\[RESULT\]\s*([1-5])/)
  if (resultOnlyMatch) {
    const score = parseInt(resultOnlyMatch[1])
    const feedback = response.replace(/\[RESULT\]\s*[1-5]/, "").replace(/^Feedback:\s*/i, "").trim()
    return { feedback, score }
  }

  // Laatste redmiddel: gebruik score 3 en de volledige response als feedback
  return { feedback: response.trim(), score: 3 }
}

async function evaluateCriterium(input: JudgeInput, criteriumIndex: number): Promise<CriteriumScore> {
  const prompt = buildJudgePrompt(input, criteriumIndex)

  try {
    const response = await ollama.chat({
      model: JUDGE_MODEL,
      messages: [{ role: "user", content: prompt }],
      options: { temperature: 0 },
    })

    const content = response.message.content?.trim() ?? ""
    const { feedback, score } = parseJudgeResponse(content)

    return {
      criterium: criteriumIndex + 1,
      naam: CRITERIA[criteriumIndex].naam,
      feedback,
      score,
    }
  } catch {
    return {
      criterium: criteriumIndex + 1,
      naam: CRITERIA[criteriumIndex].naam,
      feedback: "Beoordeling niet beschikbaar (model fout).",
      score: 3,
    }
  }
}

function bepaalBeslissing(genormaliseerdeScore: number): JudgeBeslissing {
  if (genormaliseerdeScore >= 0.75) return "goedkeuren"
  if (genormaliseerdeScore >= 0.5) return "flaggen"
  return "opnieuw_genereren"
}

export async function evalueerOpdracht(input: JudgeInput, poging = 1): Promise<JudgeResult> {
  const scores: CriteriumScore[] = []
  for (let index = 0; index < CRITERIA.length; index++) {
    scores.push(await evaluateCriterium(input, index))
  }

  const totaalScore = scores.reduce((sum, s) => sum + s.score, 0)
  const maxScore = CRITERIA.length * 5
  const genormaliseerdeScore = totaalScore / maxScore
  const beslissing = poging >= 2 && genormaliseerdeScore < 0.5
    ? "escaleren"
    : bepaalBeslissing(genormaliseerdeScore)

  return {
    scores,
    totaalScore,
    maxScore,
    genormaliseerdeScore,
    beslissing,
  }
}
