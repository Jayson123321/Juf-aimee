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
    naam: "Does the difficulty of the assignment match the student's specified Bloom level?",
    scores: {
      1: "Wrong Bloom level, no match",
      2: "Level is too high or too low",
      3: "Broadly appropriate level",
      4: "Well aligned, minor deviation",
      5: "Exactly the correct Bloom level",
    },
  },
  {
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
    naam: "Does the assignment connect to the student's starting situation as described in the OPP profile?",
    scores: {
      1: "No connection to the starting situation",
      2: "Little connection",
      3: "Partial connection",
      4: "Good connection",
      5: "Fully aligned with the starting situation",
    },
  },
  {
    naam: "Is the assignment age-appropriate in language, tone, and content for this child?",
    scores: {
      1: "Not age-appropriate",
      2: "Doubtful, risk present",
      3: "Sufficiently age-appropriate",
      4: "Well age-appropriate",
      5: "Fully age-appropriate and motivating",
    },
  },
  {
    naam: "Can a teacher easily read, assess, and if necessary adapt the assignment?",
    scores: {
      1: "Incomprehensible for the teacher",
      2: "Difficult to assess",
      3: "Understandable but not easy to adapt",
      4: "Clearly readable and adaptable",
      5: "Fully transparent and easy to adapt",
    },
  },
  {
    naam: "Can all elements in the assignment be traced back to the student profile, without invented information?",
    scores: {
      1: "Much invented information",
      2: "Some invented elements",
      3: "Largely correct",
      4: "Almost entirely correct",
      5: "Fully based on the student profile",
    },
  },
  {
    naam: "Does the assignment use only relevant student information and leave out irrelevant details?",
    scores: {
      1: "Much irrelevant information used",
      2: "Some irrelevant elements",
      3: "Reasonably focused",
      4: "Well focused",
      5: "Only relevant information used",
    },
  },
]

// Prometheus uses a fixed raw format — do NOT use ollama.chat() (Llama-2 chat template
// causes immediate EOS). Build the full prompt string and call ollama.generate() instead.
function buildJudgePrompt(input: JudgeInput, criteriumIndex: number): string {
  const criterium = CRITERIA[criteriumIndex]
  const rubricLines = Object.entries(criterium.scores)
    .map(([score, desc]) => `Score ${score}: ${desc}`)
    .join("\n")

  const systemPrompt = "You are a fair judge assistant tasked with providing clear, objective feedback based on specific criteria, ensuring each assessment reflects the absolute standards set for performance."

  const studentContext = `Student: ${input.naam}, age ${input.leeftijd}
Bloom level: ${input.bloomNiveau} | Subject: ${input.vak}
Interests: ${input.interesses}
Starting situation: ${input.beginsituatie}
Full OPP: ${input.volledigOpp?.slice(0, 1500) ?? "Not available."}`

  const taskBlock = `###Task Description:
An instruction (with student context), a response to evaluate, a reference answer, and a score rubric representing an evaluation criterion are given.
1. Write a detailed feedback (2-4 sentences) that assesses the quality of the response strictly based on the given score rubric, not evaluating in general.
2. After writing a feedback, write a score that is an integer between 1 and 5. You should refer to the score rubric.
3. The output format should look as follows: "Feedback: (write a feedback for criteria) [RESULT] (an integer number between 1 and 5)"
4. Please do not generate any other opening, closing, and explanations.

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
    // C1 - Interesses
    "An excellent assignment uses the student's documented interests (from the OPP) as the core of the task, not just as surface decoration. For a student interested in science and experiments, the task should be structured as an investigation or experiment.",
    
    // C2 - Bloom
    "An excellent assignment matches the target Bloom level precisely. For 'Creëren', the student must produce something new: design, compose, construct, or plan — not merely describe, summarize, or apply existing knowledge. The cognitive demand should match the student's documented ability level (TIQ, uitstroomperspectief).",
    
    // C3 - Zelfstandig uitvoerbaar
    "An excellent assignment has a clear starting point, well-defined scope, and outputs the student can produce independently given their age and documented work habits, while still being cognitively challenging for their ability level.",
    
    // C4 - Beginsituatie
    "An excellent assignment builds on documented strengths from the OPP (e.g. analytical thinking, autonomy, curiosity) and avoids documented weaknesses (e.g. heavy writing for a student with motor issues or writing struggles).",
    
    // C5 - Leeftijdspassend
    "An excellent assignment uses language, tone, and examples appropriate for the student's actual age — neither patronizing nor academically out of reach. Tone should be engaging and motivating.",

    // C6 - Leerkracht
    "An excellent assignment is written in clear, well-structured Dutch that a teacher can read in under a minute, evaluate for fit, and adjust or shorten without rewriting from scratch.",
    
    // C8 - Traceerbaar
    "An excellent assignment makes only claims about the student that can be directly traced to the OPP. Every personal reference (e.g. 'since you like X') must be supported by the source document. No student characteristics may be invented.",
    
    // C9 - Relevant
    "An excellent assignment uses only OPP information relevant to the task (interests, cognitive level, work style). It omits irrelevant details like medical history, family structure, or historical placement data.",
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
  if (genormaliseerdeScore >= 0.75) return "goedkeuren"
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
      keep_alive: 0,
      options: { temperature: 1.0, top_p: 0.9, repeat_penalty: 1.03, num_ctx: 4096, num_predict: 512 },
    })
    results.push(result)
  }
  
  const parsed = results.map(r => parseJudgeResponse(r.response?.trim() ?? ""))
  const avgScore = Math.round(parsed.reduce((sum, p) => sum + p.score, 0) / parsed.length)
  const bestRun = parsed.reduce((best, p) => 
    Math.abs(p.score - avgScore) < Math.abs(best.score - avgScore) ? p : best
  )
  
  return { feedback: bestRun.feedback, score: avgScore }
}

export async function evalueerOpdrachtStreaming(
  input: JudgeInput,
  onStep: (score: CriteriumScore) => void,
  poging = 1,
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
        const { feedback, score } = await scoreCriterium(input, index, 1)
        const criteriumScore: CriteriumScore = {
          criterium: index + 1,
          naam: CRITERIA[index].naam,
          feedback,
          score,
        }
        scores.push(criteriumScore)
        onStep(criteriumScore)
      } catch {
        const fallback: CriteriumScore = {
          criterium: index + 1,
          naam: CRITERIA[index].naam,
          feedback: "Beoordeling niet beschikbaar (model fout).",
          score: 3,
        }
        scores.push(fallback)
        onStep(fallback)
      }
    }
  } finally {
    await releaseOllamaModel(JUDGE_MODEL)
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
