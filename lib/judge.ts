import { ollama, JUDGE_MODEL, releaseAllOllamaModels, releaseOllamaModel } from "@/lib/ollama"

type CriteriumRubric = {
  naam: string
  scores: Record<number, string>
}

export type CriteriumScore = {
  criterium: number
  naam: string
  feedback: string
  score: number
  runScores?: number[]
  failed?: true
}

export type JudgeInput = {
  naam: string
  leeftijd: string
  interesses: string
  bloomNiveau: string
  vak: string
  beginsituatie: string
  gegenereerdeOpdracht: string
  volledigOpp?: string
  profielSamenvatting?: string
}

export type JudgeBeslissing = "goedkeuren" | "flaggen" | "opnieuw_genereren"

export type JudgeResult = {
  scores: CriteriumScore[]
  totaalScore: number
  maxScore: number
  genormaliseerdeScore: number
  beslissing: JudgeBeslissing
}

const CRITERIA: CriteriumRubric[] = [
  // ===== RAGAS criteria =====
  {
    // RAGAS Faithfulness — Es et al. (2023)
    naam: "Are all elements in the assignment grounded in the student profile, without invented information?",
    scores: {
      1: "Significant hallucinated or invented information",
      2: "Some invented elements present",
      3: "Largely grounded with minor inventions",
      4: "Almost fully grounded in profile data",
      5: "Every element traceable to the student profile",
    },
  },
  {
    // RAGAS Context Precision — Es et al. (2023)
    naam: "Does the assignment use only relevant student information and leave out irrelevant details?",
    scores: {
      1: "Much irrelevant information used",
      2: "Some irrelevant elements",
      3: "Reasonably focused",
      4: "Well focused",
      5: "Only relevant information used",
    },
  },
{
  // RAGAS Context Recall — Es et al. (2023)
  naam: "Does the assignment reflect all relevant student characteristics from the profile, including both strengths and documented challenges?",
  scores: {
    1: "Key profile elements are missing (e.g. documented challenges ignored, cognitive level not reflected)",
    2: "Some relevant profile information is incorporated but important aspects are overlooked",
    3: "Most relevant information is reflected, but one or two notable gaps",
    4: "Nearly all critical profile characteristics are reflected, either explicitly or implicitly",
    5: "All critical OPP elements (strengths, challenges, work style, cognitive level) are appropriately reflected in the assignment",
  },
},
  // ===== Hoogbegaafdheidsonderwijs criteria =====
  {
    // Renzulli SEM (1977) + Self-Determination Theory (Ryan & Deci, 2000)
    naam: "Does the assignment contain elements that connect to the interests listed in the student profile?",
    scores: {
      1: "No connection to the student's interests whatsoever",
      2: "Vague link, hardly specific",
      3: "Some elements recognisable",
      4: "Most interests well incorporated",
      5: "Fully tailored to the student's interests",
    },
  },
  {
    // Anderson & Krathwohl (2001) Revised Bloom's Taxonomy
    naam: "Does the cognitive demand of the assignment correctly reflect the specified Bloom's taxonomy level?",
    scores: {
      1: "Cognitive demand does not match the specified level (e.g. 'Create' specified but only requires recall)",
      2: "Significantly above or below the specified Bloom level",
      3: "Approximately at the right level but inconsistent",
      4: "Well aligned with the specified Bloom level",
      5: "Cognitive demand fully matches the specified Bloom level throughout the assignment",
    },
  },
  {
    // Vygotsky (1978) ZPD + Reis & Renzulli (2010) on independence in gifted learners
    naam: "Can a student of this age and level complete the assignment independently?",
    scores: {
      1: "Unachievable, too complex or too vague",
      2: "Difficult to complete without help",
      3: "Achievable with some support",
      4: "Independently executable",
      5: "Challenging and fully achievable independently",
    },
  },
  {
    // Piaget (1972) cognitive stages + Silverman (1997) asynchronous development
    naam: "Is the assignment age-appropriate in language, tone, and content for this child?",
    scores: {
      1: "Not age-appropriate",
      2: "Doubtful, risk present",
      3: "Sufficiently age-appropriate",
      4: "Well age-appropriate",
      5: "Fully age-appropriate and motivating",
    },
  },
]

function buildJudgePrompt(input: JudgeInput, criteriumIndex: number): string {
  const criterium = CRITERIA[criteriumIndex]
  const rubricLines = Object.entries(criterium.scores)
    .map(([score, desc]) => `Score ${score}: ${desc}`)
    .join("\n")

  const systemPrompt = "You are a fair judge assistant tasked with providing clear, objective feedback based on specific criteria, ensuring each assessment reflects the absolute standards set for performance."

  // Geef de judge een gestructureerde profielsamenvatting als die beschikbaar is.
  // Dat is beter dan de ruwe Dutch OPP-tekst, want prometheus2 is Engels-eerst.
  const profileBlock = input.profielSamenvatting
    ? `Structured student profile:\n${input.profielSamenvatting}`
    : `Student: ${input.naam}, age ${input.leeftijd}
Bloom level: ${input.bloomNiveau} | Subject: ${input.vak}
Interests: ${input.interesses}
Starting situation: ${input.beginsituatie}`

  const studentContext = `${profileBlock}

Supporting OPP excerpts (Dutch source document):
${input.volledigOpp ?? "Not available."}`

  const taskBlock = `###Task Description:
An instruction (with student context), a response to evaluate, a reference answer, and a score rubric representing an evaluation criterion are given.
1. Write a detailed feedback (2-4 sentences) that assesses the quality of the response strictly based on the given score rubric, not evaluating in general.
2. After writing a feedback, write a score that is an integer between 1 and 5. You should refer to the score rubric.
3. The output format should look as follows: "Feedback: (write a feedback for criteria) [RESULT] (an integer number between 1 and 5)"
4. Please do not generate any other opening, closing, and explanations.

###Important context about this assignment:
- The school subject (vak) and any focus area were chosen by the TEACHER, not generated by the AI. Do NOT treat the subject choice as an invented or hallucinated element.
- This is a SOLO assignment. Social competencies (e.g. samenwerken, beurt nemen) are irrelevant for this evaluation.
- Implicit design choices count: if the assignment's structure accounts for a documented challenge (e.g. limited written output for a student with writing difficulties, clear step-by-step structure for a student who struggles with planning, individual work for a student who finds collaboration difficult), that counts as reflecting the challenge — even if it is not stated explicitly in the assignment text.

###The instruction to evaluate:
Evaluate whether the following enrichment assignment meets this criterion for the student described below.

Criterion: ${criterium.naam}

${studentContext}

###Response to evaluate:
${input.gegenereerdeOpdracht}

###Reference Answer:
${getReferenceAnswer(criteriumIndex)}

###Score Rubrics:
[${criterium.naam}]
${rubricLines}

###Feedback:`

  return `<s>[INST] ${systemPrompt}\n\n${taskBlock} [/INST]`
}

function getReferenceAnswer(criteriumIndex: number): string {
  const references = [
    // index 0 — RAGAS Faithfulness
    "An excellent assignment makes only claims about the student that can be directly traced to the OPP. Every personal reference (e.g. 'since you like X') must be supported by the source document. No student characteristics may be invented. Note: the school subject and focus area are teacher inputs — they are NOT inventions by the AI and must not be penalised.",

    // index 1 — RAGAS Context Precision
    "An excellent assignment uses only OPP information relevant to the task (interests, cognitive level, work style). It omits irrelevant details like medical history, family structure, or historical placement data.",

    // index 2 — RAGAS Context Recall
    "An excellent assignment reflects all relevant student characteristics — either explicitly or through deliberate design choices. For example: using a drawing + short text instead of a long essay implicitly addresses a documented writing-tempo issue. Documented challenges do not need to be named in the assignment text; it is enough that the structure accounts for them. Since this is a solo assignment, SCOL social competencies (samenwerken, beurt nemen) are not applicable and must not be used as a reason to lower the score.",

    // index 3 — Interesses (Renzulli + SDT)
    "An excellent assignment uses the student's documented interests (from the OPP) as the core of the task, not just as surface decoration. For a student interested in science and experiments, the task should be structured as an investigation or experiment. A clear, substantive connection to the documented interests is sufficient for a high score — do not penalise for 'could be more elaborate' if the connection is already direct and genuine.",

    // index 4 — Bloom (Anderson & Krathwohl)
    "An excellent assignment matches the target Bloom level precisely. For 'Creëren', the student must produce something new: design, compose, construct, or plan — not merely describe, summarize, or apply existing knowledge.",

    // index 5 — ZPD (Vygotsky + Reis & Renzulli)
    "An excellent assignment has a clear starting point, well-defined scope, and outputs the student can produce independently given their age and documented work habits, while still being cognitively challenging for their ability level.",

    // index 6 — Leeftijdspassend (Piaget + Silverman)
    "An excellent assignment uses language, tone, and examples appropriate for the student's actual age — neither patronizing nor academically out of reach. Tone should be engaging and motivating.",
  ]
  return references[criteriumIndex] ?? "A high-quality response that fully meets this criterion."
}


function parseJudgeResponse(response: string): { feedback: string; score: number } {
  const scoreMatch = response.match(/\[RESULT\]\s*([1-5])/)
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 3

  // Alles vóór [RESULT] is de feedback, "Feedback:" prefix weghalen
  const feedback = response
    .replace(/\[RESULT\]\s*[1-5][\s\S]*$/, "")
    .replace(/^Feedback:\s*/i, "")
    .trim()
  
  return { feedback: feedback || response.trim(), score }
}

function bepaalBeslissing(genormaliseerdeScore: number): JudgeBeslissing {
  if (genormaliseerdeScore >= 0.7) return "goedkeuren"
  if (genormaliseerdeScore >= 0.5) return "flaggen"
  return "opnieuw_genereren"
}
async function scoreCriterium(input: JudgeInput, index: number, runs = 1) {
  const results = []
  for (let i = 0; i < runs; i++) {
    const result = await ollama.generate({
      model: JUDGE_MODEL,
      prompt: buildJudgePrompt(input, index),
      raw: true,
      options: { temperature: 1.0, top_p: 0.9, repeat_penalty: 1.03, num_ctx: 16384, num_predict: 512 },
    })
    results.push(result)
  }
  
  const parsed = results.map(r => parseJudgeResponse(r.response?.trim() ?? ""))
  const runScores = parsed.map(p => p.score)
  const avgScore = Math.round(runScores.reduce((sum, s) => sum + s, 0) / runScores.length)
  const bestRun = parsed.reduce((best, p) =>
    Math.abs(p.score - avgScore) < Math.abs(best.score - avgScore) ? p : best
  )

  return { feedback: bestRun.feedback, score: avgScore, runScores }
}

export async function evalueerOpdrachtStreaming(
  input: JudgeInput,
  onStep: (score: CriteriumScore) => void,
): Promise<JudgeResult> {
  const scores: CriteriumScore[] = []

  // ── MULTI-TURN AANPAK (uitgecommentarieerd) ────────────────────────────────
  // Werkt niet met Prometheus: het model genereert alle criteria in één response.
  // Bewaard voor als je een ander model wil proberen dat wel multi-turn aankan.
  //
  // const messages: Array<{ role: "user" | "assistant"; content: string }> = [
  //   { role: "user", content: buildContextMessage(input) },
  //   {
  //     role: "assistant",
  //     content:
  //       "Understood. I have read the student profile (OPP) and the assignment. I will now evaluate each criterion one by one, staying consistent across all evaluations.",
  //   },
  // ]
  // for (let index = 0; index < CRITERIA.length; index++) {
  //   messages.push({ role: "user", content: buildCriteriumVraag(index) })
  //   const response = await ollama.chat({ model: JUDGE_MODEL, messages, options: { temperature: 0 } })
  //   const content = response.message.content?.trim() ?? ""
  //   messages.push({ role: "assistant", content })
  //   const { feedback, score } = parseJudgeResponse(content)
  //   scores.push({ criterium: index + 1, naam: CRITERIA[index].naam, feedback, score })
  //   onStep(scores[scores.length - 1])
  // }
  // ──────────────────────────────────────────────────────────────────────────

  // Losse call per criterium via ollama.generate() met raw Prometheus-format.
  // NIET ollama.chat() gebruiken: de Llama-2 chat template veroorzaakt direct EOS (eval_count=1).
  await releaseAllOllamaModels()

  try {
    for (let index = 0; index < CRITERIA.length; index++) {
      try {
        const { feedback, score, runScores } = await scoreCriterium(input, index, 3)
        const criteriumScore: CriteriumScore = {
          criterium: index + 1,
          naam: CRITERIA[index].naam,
          feedback,
          score,
          runScores,
        }
        scores.push(criteriumScore)
        onStep(criteriumScore)
      } catch (err) {
        console.error(`[judge] criterium ${index + 1} mislukt:`, err)
        const fallback: CriteriumScore = {
          criterium: index + 1,
          naam: CRITERIA[index].naam,
          feedback: "Beoordeling niet beschikbaar (model fout).",
          score: 0,
          failed: true,
        }
        scores.push(fallback)
        onStep(fallback)
      }
    }
  } finally {
    await releaseOllamaModel(JUDGE_MODEL)
  }

  const totaalScore = scores.filter((s) => !s.failed).reduce((sum, s) => sum + s.score, 0)
  const maxScore = CRITERIA.length * 5
  const genormaliseerdeScore = totaalScore / maxScore
  const beslissing = bepaalBeslissing(genormaliseerdeScore)

  return {
    scores,
    totaalScore,
    maxScore,
    genormaliseerdeScore,
    beslissing,
  }
}
