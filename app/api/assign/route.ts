import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateAssignmentImage } from "@/lib/assignment-image";
import { executeSearchOpp, searchOppTool, zoekBeginsituatie, zoekVolledigProfiel } from "@/app/ai/tools/search_opp";
import { GEN_MODEL, getEmbedding, ollama, releaseAllOllamaModels, releaseOllamaModel } from "@/lib/ollama";
import { getBloomLevelLabel, getStudentAge } from "@/lib/student-profile";
import { evalueerOpdrachtStreaming } from "@/lib/judge";
import { callModel, getModelForRole } from "@/lib/llm-models";
import { retrieveLeerlinggeschiedenis, formatLeerlinggeschiedenis } from "@/lib/ras/retrieveLeerlinggeschiedenis";
import { analyzePortfolio, type PortfolioInsights } from "@/lib/portfolio-analysis";

// ─── Types ───────────────────────────────────────────────────────────────────

type AssignmentApiStudent = {
  id: string;
  fullName: string;
  dateOfBirth?: Date | null;
  groep: string | null;
  bloomNiveau: number | null;
  profile: { currentSchoolYearGroup: string | null } | null;
  assignments: Array<{
    title: string;
    status: string;
    bloomLevel: string | null;
    teacherFeedback?: { content: string } | null;
  }>;
};

type RejectedAssignment = { title: string; reason: string };

type McPayload = {
  question: string;
  options: string[];
  correctIndex: number;
  hints: string[];
  explanation: string;
};

type AssignmentForJudge = {
  title?: string;
  assignment?: string;
  rationale?: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeBloomLabel(label: string) {
  return label.replaceAll("ÃƒÂ«", "ë").replaceAll("Ã«", "ë");
}

function bloomLevelToNumber(label: string) {
  switch (normalizeBloomLabel(label)) {
    case "Onthouden": return 1;
    case "Begrijpen": return 2;
    case "Toepassen": return 3;
    case "Analyseren": return 4;
    case "Evalueren": return 5;
    case "Creëren": return 6;
    default: return 3;
  }
}

function parseGeneratedResponse(content: string) {
  const titleMatch = content.match(/TITLE:\s*(.+)/i);
  const assignmentMatch = content.match(/ASSIGN(?:MENT|ATION):\s*([\s\S]*?)RATIONALE:/i);
  const rationaleMatch = content.match(/RATIONALE:\s*([\s\S]*?)SOURCES:/i);

  return {
    title: titleMatch?.[1]?.trim().replace(/\*\*/g, "").trim() ?? "AI-gegenereerde opdracht",
    assignment: assignmentMatch?.[1]?.trim() ?? content.trim(),
    rationale: rationaleMatch?.[1]?.trim() ?? "",
  };
}

function inferDateOfBirthFromSources(sources: string[]): Date | null {
  for (const source of sources) {
    if (!source.toLowerCase().includes("geboortedatum")) continue;
    const match = source.match(/(\d{1,2})[\-/.](\d{1,2})[\-/.](\d{4})/);
    if (!match) continue;
    const [d, m, y] = [Number(match[1]), Number(match[2]), Number(match[3])];
    if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) continue;
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) return date;
  }
  return null;
}

function extractProfileInterestsFromSources(sources: string[]): string[] {
  const snippets = new Set<string>();
  const patterns = [
    /[^.\n]{0,80}interesse[^.\n]{0,140}[.\n]?/gi,
    /[^.\n]{0,80}nieuwsgierig[^.\n]{0,140}[.\n]?/gi,
    /[^.\n]{0,80}analytisch sterk[^.\n]{0,140}[.\n]?/gi,
    /[^.\n]{0,80}wil graag autonomie[^.\n]{0,140}[.\n]?/gi,
  ];
  for (const source of sources) {
    for (const pattern of patterns) {
      for (const raw of source.match(pattern) ?? []) {
        const cleaned = raw.replace(/\s+/g, " ").trim();
        if (cleaned.length >= 12) snippets.add(cleaned);
      }
    }
  }
  return [...snippets].slice(0, 3);
}

/**
 * Destilleert de ruwe OPP-bronnen naar een beknopte Engelse profielsamenvating.
 * Dit gaat naar de judge (prometheus-7b, Engels-eerst) zodat hij concrete feiten
 * kan toetsen in plaats van een berg ruwe Nederlandse tekst te moeten doorspitten.
 */
function buildProfileSummary(sources: string[], bloomLevel: string): string {
  const allText = sources.join(" ");

  const tiqMatch = allText.match(/TIQ\s+(\d+)/);
  const uitstroomMatch = allText.match(/[Uu]itstroom[a-zëA-Z]*[:\s]+([A-Z][^\n.,]{3,40})/);
  const groepMatch = allText.match(/groep\s+(\d)/i);

  const extract = (patterns: RegExp[]) => {
    const hits = new Set<string>();
    for (const p of patterns) {
      for (const m of allText.matchAll(new RegExp(p.source, p.flags.includes("g") ? p.flags : p.flags + "g"))) {
        const v = (m[1] ?? m[0]).replace(/\s+/g, " ").trim().slice(0, 80);
        if (v.length >= 6) hits.add(v);
      }
    }
    return [...hits].slice(0, 4);
  };

  const interests = extract([
    /interesse in ([^.\n]{4,60})/i,
    /bijzondere interesse in ([^.\n]{4,60})/i,
    /gemotiveerd bij ([^.\n]{4,60})/i,
    /passie voor ([^.\n]{4,60})/i,
  ]);
  const strengths = extract([
    /analytisch sterk[^.\n]{0,60}/i,
    /snel verbanden ([^.\n]{4,60})/i,
    /sterk in redeneren[^.\n]{0,40}/i,
    /nieuwsgierig[^.\n]{0,60}/i,
  ]);
  const constraints = extract([
    /weerstand bij ([^.\n]{4,60})/i,
    /lage motivatie voor ([^.\n]{4,60})/i,
    /slordig[^.\n]{0,60}/i,
    /moeite met ([^.\n]{4,60})/i,
  ]);
  const motivators = extract([
    /autonomie[^.\n]{0,60}/i,
    /experimenten[^.\n]{0,60}/i,
    /onderzoekend[^.\n]{0,60}/i,
    /verrijking[^.\n]{0,60}/i,
  ]);

  const lines: string[] = [
    `Target Bloom level: ${bloomLevel}`,
    tiqMatch ? `Cognitive score: TIQ ${tiqMatch[1]}` : null,
    uitstroomMatch ? `Expected school trajectory: ${uitstroomMatch[1].trim()}` : null,
    groepMatch ? `Current school year: groep ${groepMatch[1]}` : null,
    interests.length ? `Documented interests: ${interests.join(" | ")}` : null,
    strengths.length ? `Documented strengths: ${strengths.join(" | ")}` : null,
    constraints.length ? `Documented constraints/avoidances: ${constraints.join(" | ")}` : null,
    motivators.length ? `Motivation triggers: ${motivators.join(" | ")}` : null,
  ].filter(Boolean) as string[];

  return lines.join("\n");
}

/** Legt in 1 zin uit wat het gevraagde Bloom-niveau concreet betekent voor de opdrachtvorm. */
function bloomVerbGuide(label: string): string {
  const guides: Record<string, string> = {
    "Onthouden": "herinneren, benoemen, opsommen, herkennen — de leerling reproduceert informatie",
    "Begrijpen": "uitleggen, samenvatten, vergelijken, classificeren — de leerling toont begrip van de stof",
    "Toepassen": "gebruiken, uitvoeren, berekenen, oplossen — de leerling past aangeleerde kennis toe in een nieuwe situatie",
    "Analyseren": "onderbouwen, vergelijken, differentiëren, onderzoeken — de leerling breekt informatie op in onderdelen",
    "Evalueren": "beoordelen, verdedigen, bekritiseren, rechtvaardigen — de leerling geeft een onderbouwd oordeel over iets",
    "Creëren": "ontwerpen, construeren, samenstellen, schrijven, plannen — de leerling MAAKT iets nieuws dat nog niet bestond; puur beschrijven of onderzoeken is niet genoeg",
  };
  return guides[label] ?? `past bij Bloom-niveau ${label}`;
}

function tryParseJson(raw: string): unknown {
  try { return JSON.parse(raw.trim()); } catch { return null; }
}

function extractJson(raw: string): unknown {
  if (!raw) return null;
  const direct = tryParseJson(raw);
  if (direct !== null) return direct;

  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    const parsed = tryParseJson(fenceMatch[1]);
    if (parsed !== null) return parsed;
  }

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const parsed = tryParseJson(raw.slice(firstBrace, lastBrace + 1));
    if (parsed !== null) return parsed;
  }

  return null;
}

function validateMcOutput(raw: unknown): McPayload | { error: string } {
  if (!raw || typeof raw !== "object") return { error: "output is geen object" };
  const obj = raw as Record<string, unknown>;

  if (typeof obj.error === "string") return { error: obj.error };

  const question = typeof obj.question === "string" ? obj.question.trim() : "";
  const options = Array.isArray(obj.options) ? obj.options.map((o) => String(o).trim()) : [];
  const correctIndex = typeof obj.correctIndex === "number" ? obj.correctIndex : -1;
  const hintsRaw = Array.isArray(obj.hints) ? obj.hints.map((h) => String(h).trim()).filter(Boolean) : [];
  const explanation = typeof obj.explanation === "string" ? obj.explanation.trim() : "";

  if (!question) return { error: "question ontbreekt" };
  if (options.length !== 4) return { error: "options moet 4 items hebben" };
  if (new Set(options).size !== 4) return { error: "options bevatten duplicaten" };
  if (correctIndex < 0 || correctIndex > 3) return { error: "correctIndex buiten bereik" };
  if (hintsRaw.length < 1) return { error: "minstens 1 hint nodig" };
  if (!explanation) return { error: "explanation ontbreekt" };

  const correctAnswer = options[correctIndex].toLowerCase();
  if (question.toLowerCase().includes(correctAnswer) && correctAnswer.length > 2) {
    return { error: "juiste antwoord staat letterlijk in de vraag" };
  }

  return { question, options, correctIndex, hints: hintsRaw.slice(0, 3), explanation };
}

function derivePlanTitle(plan: Record<string, unknown>, focusArea: string, bloomLevel: string): string {
  const explicit =
    typeof plan.title === "string" ? plan.title :
    typeof plan.titel === "string" ? (plan.titel as string) : "";
  if (explicit.trim()) return explicit.trim();
  return `Meerkeuzevraag ${focusArea || "Algemeen"} (${bloomLevel})`;
}

async function buildJudgeInput(args: {
  student: AssignmentApiStudent;
  resolvedBloom: string;
  focusArea: string;
  sources: string[];
  assignment: AssignmentForJudge;
}) {
  const { student, resolvedBloom, focusArea, sources, assignment } = args;

  const inferredDateOfBirth = student.dateOfBirth ?? inferDateOfBirthFromSources(sources);
  if (!student.dateOfBirth && inferredDateOfBirth) {
    await prisma.student.update({ where: { id: student.id }, data: { dateOfBirth: inferredDateOfBirth } });
  }

  const leeftijd = getStudentAge(inferredDateOfBirth);
  const leeftijdLabel = leeftijd ? `${leeftijd} jaar` : "onbekend";
  const interestSnippets = extractProfileInterestsFromSources(sources);
  const interessesLabel = interestSnippets.length > 0
    ? interestSnippets.map((s) => `"${s}"`).join("; ")
    : "Niet expliciet benoemd in OPP-bronnen";
  const beginsituatieBronnen = await zoekBeginsituatie(student.id);
  const beginsituatie = beginsituatieBronnen.join("\n\n").slice(0, 800) || "Geen OPP-informatie beschikbaar.";

  return {
    naam: student.fullName,
    leeftijd: leeftijdLabel,
    interesses: interessesLabel,
    bloomNiveau: resolvedBloom,
    vak: focusArea || "Algemeen",
    beginsituatie,
    gegenereerdeOpdracht: assignment.assignment ?? "",
    volledigOpp: sources.join("\n\n---\n\n"),
  };
}

// ─── Prompts ─────────────────────────────────────────────────────────────────

function buildGenerationPrompt(args: {
  student: AssignmentApiStudent;
  resolvedBloom: string;
  focusArea: string;
  estimatedTime: string;
  sources: string[];
  teacherPrompt?: string;
  currentAssignment?: { title?: string; assignment?: string; rationale?: string } | null;
  rejectedAssignments?: RejectedAssignment[];
  judgeFeedback?: string;
  geschiedenis?: string;
  portfolioInsights?: PortfolioInsights;
}) {
  const { student, resolvedBloom, focusArea, estimatedTime, sources, teacherPrompt, currentAssignment, rejectedAssignments, judgeFeedback, geschiedenis, portfolioInsights } = args;
  const oppBronnen = sources.length > 0
    ? sources.join("\n\n---\n\n")
    : "Geen OPP-informatie beschikbaar.";

  return `Je bent Juf Aimee: een deskundige in hoogbegaafdheidsonderwijs op de basisschool.

Je taak is een gepersonaliseerde verrijkingsopdracht maken voor een hoogbegaafde leerling.
Gebruik eenvoudig, helder Nederlands zonder abstracte begrippen.

OPP-PROFIEL VAN DE LEERLING
Dit is alle beschikbare profielinformatie. Gebruik dit als enige bron voor interesses, cognitief niveau, motivatie en beperkingen.

${oppBronnen}

HARDE EISEN:
1. De opdracht gaat over het schoolvak: ${focusArea || "een schoolvak naar keuze"}
2. De opdracht past bij Bloom-niveau: ${resolvedBloom}
   → Wat dit concreet betekent: ${bloomVerbGuide(resolvedBloom)}
3. De geschatte tijd voor de opdracht is: ${estimatedTime || "niet opgegeven"}
   → Pas de scope, diepgang en het eindproduct STRIKT aan op deze tijdsduur. Een opdracht van 45 minuten past op één werkmoment; een weekopdracht mag meerdere stappen hebben.
4. Gebruik ALLEEN interesses die je via search_opp hebt gevonden — negeer alle andere profieldata over interesses
5. Afgekeurde opdrachten: genereer NOOIT een opdracht die lijkt op eerder afgekeurde opdrachten qua thema of format
6. De opdracht is praktisch en concreet, niet abstract
7. Ambitieniveau moet matchen met uitstroomperspectief en TIQ
8. Opdrachtformat mag NOOIT botsen met motorische/zelfredzaamheid-beperkingen
9. Opdracht moet ruimte bieden voor motivatietriggers (autonomie, keuze, diepte)
10. Opdracht mag GEEN elementen bevatten die in motivatie-afbrekers staan
11. Opdrachtscope moet passen bij planning-vaardigheden (kort bij zwakke planning, lang bij sterke)
12. Als er groeigebieden zijn (bv. samenwerken, flexibiliteit): opdracht mag deze zachtjes uitnodigen, niet afdwingen
13. In de RATIONALE: beschrijf beperkingen PRECIES zoals het OPP ze vermeldt — verzwaar of verzacht ze niet

LEERLING
Naam: ${student.fullName}
Student ID: ${student.id}
Groep: ${student.profile?.currentSchoolYearGroup ?? student.groep ?? "onbekend"}
Bloom niveau: ${resolvedBloom}

HUIDIGE VERSIE
${currentAssignment
  ? `Titel: ${currentAssignment.title ?? "onbekend"}\nOpdracht:\n${currentAssignment.assignment ?? ""}`
  : "Er is nog geen eerdere versie."}

INSTRUCTIE VAN DE LEERKRACHT
${teacherPrompt || "Maak de best passende eerste versie."}

LEERLINGGESCHIEDENIS (gebruik dit om de nieuwe opdracht beter te laten aansluiten op wat de leerling eerder heeft gedaan)
${geschiedenis ?? "Geen eerdere opdrachten beschikbaar."}

PORTFOLIO ANALYSE (gebruik dit om rekening te houden met de ontwikkeling van de leerling)
${portfolioInsights?.portfolioSummary
  ? `${portfolioInsights.portfolioSummary}${portfolioInsights.suggestedNextBloom ? `\nAanbevolen Bloom-niveau voor nieuwe opdracht: ${portfolioInsights.suggestedNextBloom}` : ""}`
  : "Geen eerdere opdrachten beschikbaar."}

VERBODEN ONDERWERPEN EN FORMATS (uit afgekeurde opdrachten)
${rejectedAssignments?.length
  ? rejectedAssignments.map((r) => `- "${r.title}": ${r.reason}`).join("\n")
  : "Geen afgekeurde opdrachten bekend."}
${judgeFeedback ? `\n${judgeFeedback}\n` : ""}
Geef exact dit formaat terug:
TITLE: <korte titel — alleen platte tekst, geen markdown>
ASSIGNMENT:
<Spreek de leerling direct aan bij naam. Geef de opdracht structuur met genummerde stappen (Stap 1 — ..., Stap 2 — ..., etc.). Elke stap bevat een concrete actie én 1-2 stuurvragen die de leerling op weg helpen. Sluit af met een regel "Eindproduct:" die precies beschrijft wat er opgeleverd wordt. Stem het aantal stappen en de diepgang af op de beschikbare tijd (${estimatedTime || "niet opgegeven"}). Schrijf in verzorgd Nederlands.>
RATIONALE:
<Schrijf een volledige onderbouwing. Bespreek elk relevant aspect van de opdracht: interesse/motivatie, Bloom-niveau, sterke punten, beperkingen of groeigebieden, tijdsduur, opdrachtstructuur en eventuele tips uit het OPP. Gebruik ALLEEN informatie die letterlijk in de OPP-bronnen hierboven staat. Verwijs expliciet naar de bron: schrijf bv. "Volgens het OPP..." of "De leerkrachtfeedback meldt...". Verzin GEEN eigenschappen of beperkingen die niet in de bronnen staan.>
SOURCES:
<bronnen die je hebt gebruikt>`;
}

function buildPlannerPrompt(args: {
  studentName: string;
  groep: string;
  bloomLevel: string;
  focusArea: string;
  sources: string[];
}) {
  const { studentName, groep, bloomLevel, focusArea, sources } = args;
  const rag = sources.length > 0 ? sources.join("\n\n---\n\n") : "Geen OPP-bronnen gevonden.";

  return `SCHOOLVAK (= onderwerp van de vraag)
${focusArea}

BLOOM-NIVEAU (= denkniveau van de vraag)
${bloomLevel}

LEERLING (= voor wie is de vraag, alleen ter personalisatie)
Naam: ${studentName}
Groep: ${groep}

OPP-BRONNEN OVER DEZE LEERLING (= ALLEEN om de vraag te personaliseren — NIET het onderwerp!)
Deze tekst beschrijft WIE de leerling is, niet WAT ze moet leren. Gebruik deze
informatie om te kiezen welk onderwerp binnen "${focusArea}" haar aanspreekt,
welke context (voorbeelden, interesses) haar motiveert, en welk taalniveau past.
De vraag die je maakt gaat OVER ${focusArea}, niet over de leerling zelf.

${rag}

Maak nu het JSON-plan voor een meerkeuzevraag over ${focusArea}, volgens het schema in je instructie.`;
}

function buildGemmaPrompt(args: {
  student: AssignmentApiStudent;
  resolvedBloom: string;
  focusArea: string;
  vak: string;
  profileSources: string[];
  feedbackTexts: string[];
  reflections: Array<{ assignmentTitle: string; content: string }>;
  previousAssignments: Array<{ title: string; status: string; bloomLevel: string | null }>;
}) {
  const { student, resolvedBloom, focusArea, vak, profileSources, feedbackTexts, reflections, previousAssignments } = args;
  const subject = vak || focusArea || "Algemeen";
  const groep = student.profile?.currentSchoolYearGroup ?? student.groep ?? "onbekend";

  const profileBlock = profileSources.length
    ? profileSources.slice(0, 5).join("\n\n---\n\n")
    : "Geen aanvullende OPP-informatie beschikbaar.";

  const feedbackBlock = feedbackTexts.length
    ? feedbackTexts.slice(0, 5).map((t, i) => `${i + 1}. ${t}`).join("\n\n")
    : "Geen eerdere leerkrachtfeedback beschikbaar.";

  const reflectionBlock = reflections.length
    ? reflections.map((r, i) => `${i + 1}. Bij "${r.assignmentTitle}": ${r.content}`).join("\n\n")
    : "Geen eerdere reflecties van de leerling beschikbaar.";

  const previousBlock = previousAssignments.length
    ? previousAssignments.map((a, i) => `${i + 1}. "${a.title}" (status: ${a.status}, niveau: ${a.bloomLevel ?? "onbekend"})`).join("\n")
    : "Geen eerdere opdrachten beschikbaar.";

  return `Je bent een onderwijsdeskundige gespecialiseerd in hoogbegaafdheidsonderwijs op de basisschool.

Maak een uitgebreide, concrete en uitdagende verrijkingsopdracht voor de volgende leerling.
Gebruik de hieronder verzamelde context (profiel, leerkrachtfeedback, reflecties en eerdere
opdrachten) om de opdracht echt persoonlijk te maken — vermijd herhaling van eerdere opdrachten
en sluit aan op wat eerder werkte of juist niet.

LEERLING: ${student.fullName}
GROEP: ${groep}
BLOOM-NIVEAU: ${resolvedBloom}
SCHOOLVAK: ${subject}
FOCUSGEBIED: ${focusArea || subject}

STUDENTPROFIEL (uit OPP)
${profileBlock}

EERDERE LEERKRACHTFEEDBACK
${feedbackBlock}

REFLECTIES VAN DE LEERLING OP EERDERE OPDRACHTEN
${reflectionBlock}

EERDERE OPDRACHTEN (vermijd herhaling van onderwerp en format)
${previousBlock}

EISEN AAN DE OPDRACHT:
- Schrijf in helder, verzorgd Nederlands
- De opdracht is minimaal 400 woorden lang
- Begin met een duidelijke, pakkende titel
- Geef een gedetailleerde taakomschrijving met concrete stappen
- Sluit aan bij Bloom-niveau: ${resolvedBloom}
- Voeg beoordelingscriteria toe (wat wordt er beoordeeld?)
- Eindig met 3 uitdagende verdiepingsvragen die verder denken stimuleren
- De opdracht is praktisch uitvoerbaar binnen een schoolsetting
- De opdracht past bij een hoogbegaafde leerling die extra uitdaging nodig heeft
- Bouw voort op wat goed werkte volgens feedback en reflecties; vermijd onderwerpen of formats van eerdere opdrachten

Geef een volledige, goed gestructureerde opdracht.`;
}

function buildJudgeFeedback(scores: import("@/lib/judge").CriteriumScore[], bloomNiveau: string): string {
  const criteriumInstructie: Record<number, string> = {
    1: "De opdracht bevat verzonnen informatie die niet traceerbaar is naar het OPP. Gebruik ALLEEN informatie die letterlijk in de bronnen staat.",
    2: "De opdracht gebruikt irrelevante profielinformatie. Gebruik alleen wat direct relevant is voor de taak.",
    3: "Belangrijke profielkenmerken (sterke punten én beperkingen) worden niet weerspiegeld. Verwerk alle relevante OPP-informatie.",
    4: "De opdracht sluit niet aan op de gedocumenteerde interesses. Verwerk de interesses als kern van de opdracht, niet als decoratie.",
    5: `Het cognitieve niveau klopt niet met Bloom-niveau "${bloomNiveau}". ${bloomVerbGuide(bloomNiveau)}`,
    6: "De opdracht is niet zelfstandig uitvoerbaar voor deze leerling. Maak de scope concreter en haalbaarder.",
    7: "De opdracht is niet leeftijdspassend in taal, toon of inhoud. Pas het taalniveau en de toon aan.",
  }

  const poor = scores.filter((s) => s.score <= 2)
  if (poor.length === 0) return ""

  const lines = poor.map((s) => `- ${criteriumInstructie[s.criterium] ?? s.feedback}`)
  return `VERBETERPUNTEN UIT VORIGE VERSIE:\n${lines.join("\n")}`
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    action,
    studentId,
    focusArea = "",
    bloomLevel = "",
    teacherPrompt = "",
    currentAssignment = null,
    imagePrompt = "",
    previousImageUrl = null,
    estimatedTime = "",
    vak = "",
  } = body ?? {};

  if (!studentId || !action) {
    return NextResponse.json({ error: "studentId en action zijn verplicht." }, { status: 400 });
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      profile: { select: { currentSchoolYearGroup: true, schoolHistory: true } },
      assignments: {
        select: {
          title: true,
          status: true,
          bloomLevel: true,
          teacherFeedback: { select: { content: true } },
        },
        where: { status: "COMPLETED" },
        orderBy: { updatedAt: "desc" },
        take: 10,
      },
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Student niet gevonden." }, { status: 404 });
  }

  const portfolioInsights = analyzePortfolio(student.assignments);
  const resolvedBloom = normalizeBloomLabel(bloomLevel || getBloomLevelLabel(student.bloomNiveau));

  try {
    let sources: string[] = [];
    // Haal OPP-bronnen + leerkrachtfeedback + leerlinggeschiedenis op
    const [profileSources, feedbackChunks, geschiedenisItems] = await Promise.all([
      zoekVolledigProfiel(student.id, focusArea),
      prisma.oppChunk.findMany({
        where: { studentId: student.id, tekst: { contains: "[LEERKRACHT FEEDBACK" } },
        select: { tekst: true },
        orderBy: { id: "desc" },
        take: 5,
      }),
      retrieveLeerlinggeschiedenis(student.id),
    ]);
    const geschiedenis = formatLeerlinggeschiedenis(geschiedenisItems);
    const sources = [...new Set([...profileSources, ...feedbackChunks.map((c) => c.tekst)])];
    // For non-generate actions, fetch sources upfront
    const needsSourcesUpfront = action !== "generate" && action !== "revise";
    let sources: string[] = [];
    if (needsSourcesUpfront) {
      const [profileSources, feedbackChunks] = await Promise.all([
        zoekVolledigProfiel(student.id, focusArea),
        prisma.oppChunk.findMany({
          where: { studentId: student.id, tekst: { contains: "[LEERKRACHT FEEDBACK" } },
          select: { tekst: true },
          orderBy: { id: "desc" },
          take: 5,
        }),
      ]);
      sources = [...new Set([...profileSources, ...feedbackChunks.map((c) => c.tekst)])];
    }

    // ── Actie: bronnen zoeken ─────────────────────────────────────────────────
    if (action === "search") {
      return NextResponse.json({ sources });
    }

    // ── Actie: goedkeuren ─────────────────────────────────────────────────────
    if (action === "generate_image") {
      if (!currentAssignment?.assignment || !currentAssignment?.title) {
        return NextResponse.json(
          { error: "Geen opdracht beschikbaar om een afbeelding voor te maken." },
          { status: 400 },
        );
      }

      await releaseAllOllamaModels();

      const generatedImage = await generateAssignmentImage({
        studentId: student.id,
        studentName: student.fullName,
        focusArea: focusArea || "algemene verdieping",
        bloomLevel: resolvedBloom,
        assignmentTitle: currentAssignment.title,
        assignmentText: currentAssignment.assignment,
        rationale:
          typeof currentAssignment.rationale === "string" ? currentAssignment.rationale : undefined,
        interests: extractProfileInterestsFromSources(sources),
        promptOverride: typeof imagePrompt === "string" ? imagePrompt : undefined,
        previousImageUrl: typeof previousImageUrl === "string" ? previousImageUrl : undefined,
      });

      return NextResponse.json(generatedImage);
    }

    if (action === "judge") {
      if (!currentAssignment?.assignment) {
        return NextResponse.json({ error: "Geen opdracht beschikbaar om te beoordelen." }, { status: 400 });
      }

      await releaseAllOllamaModels();

      const judgeInput = await buildJudgeInput({
        student,
        resolvedBloom,
        focusArea,
        sources,
        assignment: currentAssignment,
      });

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const send = (event: Record<string, unknown>) => {
            controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
          };

          try {
            send({ type: "judge_start", data: { total: 7 } });

            const judgeResult = await evalueerOpdrachtStreaming(
              judgeInput,
              (step) => send({ type: "judge_step", data: step }),
            );

            send({ type: "judge_done", data: judgeResult });
            controller.close();
          } catch (error) {
            send({
              type: "error",
              data: { message: error instanceof Error ? error.message : "Beoordeling mislukt." },
            });
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "application/x-ndjson",
          "Transfer-Encoding": "chunked",
          "Cache-Control": "no-cache",
        },
      });
    }

    if (action === "approve") {
      if (!currentAssignment?.assignment || !currentAssignment?.title) {
        return NextResponse.json({ error: "Geen opdracht beschikbaar om goed te keuren." }, { status: 400 });
      }

      const mcContent = currentAssignment.interactiveContent as McPayload | undefined;
      const isMc = Boolean(mcContent && Array.isArray(mcContent.options));

      const saved = await prisma.assignment.create({
        data: {
          studentId: student.id,
          title: currentAssignment.title,
          description: currentAssignment.assignment,
          uitleg: currentAssignment.rationale ?? "Goedgekeurde opdracht",
          illustrationUrl:
            typeof currentAssignment.illustrationUrl === "string" &&
            currentAssignment.illustrationUrl.trim()
              ? currentAssignment.illustrationUrl.trim()
              : null,
          illustrationPrompt:
            typeof currentAssignment.illustrationPrompt === "string" &&
            currentAssignment.illustrationPrompt.trim()
              ? currentAssignment.illustrationPrompt.trim()
              : null,
          bloomLevel: resolvedBloom,
          bloomNiveau: bloomLevelToNumber(resolvedBloom),
          status: "PENDING",
          assignmentType: isMc ? "MULTIPLE_CHOICE" : "TEXT",
          interactiveContent: isMc ? mcContent : undefined,
        },
      });
      return NextResponse.json({ ok: true, savedAssignmentId: saved.id });
    }

    // ── Actie: afkeuren ───────────────────────────────────────────────────────
    if (action === "reject") {
      const { rejectReason, assignmentTitle } = body ?? {};
      if (!rejectReason?.trim()) {
        return NextResponse.json({ error: "Reden van afkeuring is verplicht." }, { status: 400 });
      }
      const feedbackText = `[LEERKRACHT FEEDBACK - afgekeurde opdracht]\nOpdrachttitel: "${assignmentTitle ?? "onbekend"}"\nReden van afkeuring: "${rejectReason.trim()}"`;
      try {
        const embedding = await getEmbedding(feedbackText);
        await prisma.$executeRaw`
          INSERT INTO "OppChunk" ("studentId", "tekst", "embedding")
          VALUES (${student.id}, ${feedbackText}, ${`[${embedding.join(",")}]`}::vector)
        `;
      } catch {
        await prisma.$executeRaw`INSERT INTO "OppChunk" ("studentId", "tekst") VALUES (${student.id}, ${feedbackText})`;
      }
      return NextResponse.json({ ok: true });
    }

    // ── Actie: feedback opslaan ───────────────────────────────────────────────
    if (action === "feedback") {
      const { assignmentId, feedback } = body ?? {};
      if (!feedback?.trim()) {
        return NextResponse.json({ error: "Feedback is verplicht." }, { status: 400 });
      }
      if (assignmentId) {
        await prisma.teacherFeedback.upsert({
          where: { assignmentId },
          create: { assignmentId, content: feedback.trim() },
          update: { content: feedback.trim() },
        });
      }
      const feedbackText = `[LEERKRACHT FEEDBACK - goedgekeurde opdracht]\nOpdracht ID: "${assignmentId ?? "onbekend"}"\nFeedback: "${feedback.trim()}"`;
      try {
        const embedding = await getEmbedding(feedbackText);
        await prisma.$executeRawUnsafe(
          `INSERT INTO "OppChunk" ("studentId", "tekst", "embedding") VALUES ($1, $2, $3::vector)`,
          student.id, feedbackText, `[${embedding.join(",")}]`,
        );
      } catch {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "OppChunk" ("studentId", "tekst") VALUES ($1, $2)`,
          student.id, feedbackText,
        );
      }
      return NextResponse.json({ ok: true });
    }

    // ── Actie: Gemma 4 — uitgebreide opdracht genereren (5-staps RAG) ────────
    if (action === "generate_gemma") {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const send = (event: Record<string, unknown>) => {
            controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
          };
          try {
            // Stap 1: Studentprofiel ophalen (RAG via OPP)
            send({ type: "gemma_step", data: { stage: 1, status: "running" } });
            const profileSources = await zoekVolledigProfiel(student.id, focusArea);
            send({ type: "gemma_step", data: { stage: 1, status: "done" } });

            // Stap 2: Leerkrachtfeedback verzamelen
            send({ type: "gemma_step", data: { stage: 2, status: "running" } });
            const feedbackChunks = await prisma.oppChunk.findMany({
              where: { studentId: student.id, tekst: { contains: "[LEERKRACHT FEEDBACK" } },
              select: { tekst: true },
              orderBy: { id: "desc" },
              take: 5,
            });
            send({ type: "gemma_step", data: { stage: 2, status: "done" } });

            // Stap 3: Reflecties van de leerling ophalen
            send({ type: "gemma_step", data: { stage: 3, status: "running" } });
            const reflectionRows = await prisma.reflection.findMany({
              where: { assignment: { studentId: student.id } },
              select: { content: true, assignment: { select: { title: true } } },
              orderBy: { createdAt: "desc" },
              take: 5,
            });
            const reflections = reflectionRows.map((r) => ({
              assignmentTitle: r.assignment.title,
              content: r.content,
            }));
            send({ type: "gemma_step", data: { stage: 3, status: "done" } });

            // Stap 4: Eerdere opdrachten ophalen
            send({ type: "gemma_step", data: { stage: 4, status: "running" } });
            const previousAssignments = await prisma.assignment.findMany({
              where: { studentId: student.id },
              select: { title: true, status: true, bloomLevel: true },
              orderBy: { createdAt: "desc" },
              take: 5,
            });
            send({ type: "gemma_step", data: { stage: 4, status: "done" } });

            // Stap 5: Genereren met Gemma 4
            send({ type: "gemma_step", data: { stage: 5, status: "running" } });
            const prompt = buildGemmaPrompt({
              student,
              resolvedBloom,
              focusArea,
              vak,
              profileSources,
              feedbackTexts: feedbackChunks.map((c) => c.tekst),
              reflections,
              previousAssignments,
            });
            const response = await ollama.chat({
              model: "qwen3:14b",
              messages: [{ role: "user", content: prompt }],
              stream: true,
            });
            for await (const chunk of response) {
              const text = chunk.message?.content;
              if (text) send({ type: "chunk", data: text });
            }
            send({ type: "gemma_step", data: { stage: 5, status: "done" } });
            send({ type: "done" });
            controller.close();
          } catch (error) {
            send({ type: "error", data: { message: error instanceof Error ? error.message : "Gemma genereren mislukt." } });
            controller.close();
          }
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "application/x-ndjson",
          "Transfer-Encoding": "chunked",
          "Cache-Control": "no-cache",
        },
      });
    }

    // ── Actie: meerkeuzevraag genereren (Planner → Coder) ────────────────────
    if (action === "generate_mc") {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
        const send = (event: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        };

        try {
          send({ type: "sources", data: sources });
          await releaseAllOllamaModels();

          const plannerUserPrompt = buildPlannerPrompt({
              studentName: student.fullName,
              groep: student.profile?.currentSchoolYearGroup ?? student.groep ?? "onbekend",
              bloomLevel: resolvedBloom,
              focusArea: focusArea || "een schoolvak naar keuze",
              sources,
            });

            send({ type: "stage", data: { stage: "planner", status: "running" } });

            const plannerModel = getModelForRole("planner");
            const plannerResponse = await (async () => {
              try {
                return await callModel("planner", plannerUserPrompt, {
                  temperature: 0.4,
                  format: "json",
                  keepAlive: 0,
                });
              } finally {
                await releaseOllamaModel(plannerModel);
              }
            })();
            const plan = extractJson(plannerResponse.message.content?.trim() ?? "");
            if (!plan || typeof plan !== "object") {
              throw new Error("Planner gaf geen geldig JSON-plan terug.");
            }

            send({ type: "plan", data: plan });
            send({ type: "stage", data: { stage: "coder", status: "running" } });

            const coderModel = getModelForRole("coder");
            const validated = await (async () => {
              try {
                let repairFeedback = "";

                for (let attempt = 0; attempt < 3; attempt += 1) {
                  const coderUserPrompt = `Hier is het ruwe plan van de Planner. Normaliseer en valideer het naar het MC-component JSON-schema.

PLAN:
${JSON.stringify(plan, null, 2)}
${repairFeedback ? `\n\nHERSTEL FEEDBACK:\n${repairFeedback}` : ""}`;

                  const coderResponse = await callModel("coder", coderUserPrompt, {
                    temperature: 0.2,
                    format: "json",
                    keepAlive: 0,
                  });

                  const mc = extractJson(coderResponse.message.content?.trim() ?? "");
                  const candidate = validateMcOutput(mc);
                  if (!("error" in candidate)) {
                    return candidate;
                  }

                  repairFeedback = `De vorige output was ongeldig: ${candidate.error}. Lever een nieuwe versie die WEL geldig is. Vooral belangrijk: het juiste antwoord mag niet letterlijk in de vraagtekst staan, er moeten exact 4 unieke antwoordopties zijn en de explanation moet ingevuld zijn.`;
                }

                throw new Error("Coder output bleef ongeldig na 3 herstelpogingen.");
              } finally {
                await releaseOllamaModel(coderModel);
              }
            })();

            const rationale = typeof (plan as Record<string, unknown>).rationale === "string"
              ? ((plan as Record<string, unknown>).rationale as string) : "";

            send({
              type: "mc_question",
              data: {
                title: derivePlanTitle(plan as Record<string, unknown>, focusArea, resolvedBloom),
                assignment: validated.question,
                rationale,
                sources,
                interactiveContent: validated,
              },
            });

            send({ type: "stage", data: { stage: "coder", status: "done" } });
            controller.close();
          } catch (error) {
            send({
              type: "error",
              data: { message: error instanceof Error ? error.message : "Meerkeuzevraag genereren mislukt." },
            });
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "application/x-ndjson",
          "Transfer-Encoding": "chunked",
          "Cache-Control": "no-cache",
        },
      });
    }

    // ── Actie: genereren / aanpassen (tekst-opdracht, streaming) ─────────────
    if (action !== "generate" && action !== "revise") {
      return NextResponse.json({ error: "Onbekende actie." }, { status: 400 });
    }
    if (action === "revise" && !teacherPrompt.trim()) {
      return NextResponse.json({ error: "Geef eerst een instructie mee voor de aanpassing." }, { status: 400 });
    }

    const inferredDateOfBirth = student.dateOfBirth ?? inferDateOfBirthFromSources(sources);
    if (!student.dateOfBirth && inferredDateOfBirth) {
      await prisma.student.update({ where: { id: student.id }, data: { dateOfBirth: inferredDateOfBirth } });
    }

    const leeftijd = getStudentAge(inferredDateOfBirth);
    const leeftijdLabel = leeftijd ? `${leeftijd} jaar` : "onbekend";
    const interestSnippets = extractProfileInterestsFromSources(sources);
    const interessesLabel = interestSnippets.length > 0
      ? interestSnippets.map((s) => `"${s}"`).join("; ")
      : "Niet expliciet benoemd in OPP-bronnen";
    const beginsituatieBronnen = await zoekBeginsituatie(student.id);
    const beginsituatie = beginsituatieBronnen.join("\n\n").slice(0, 800) || "Geen OPP-informatie beschikbaar.";
    // Gestructureerde Engelse profielsamenvatting voor de judge
    const profielSamenvatting = buildProfileSummary(sources, resolvedBloom);

    const rejectedChunks = await prisma.oppChunk.findMany({
      where: { studentId: student.id, tekst: { contains: "[LEERKRACHT FEEDBACK - afgekeurde opdracht]" } },
      select: { tekst: true },
    });
    const rejectedAssignments: RejectedAssignment[] = rejectedChunks.map(({ tekst }) => ({
      title: tekst.match(/Opdrachttitel:\s*"([^"]+)"/)?.[1] ?? "onbekend",
      reason: tekst.match(/Reden van afkeuring:\s*"([^"]+)"/)?.[1] ?? tekst,
    }));

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        };

        try {
          // Step 1: Feedback ophalen
          send({ type: "step", data: 1 });
          const feedbackChunks = await prisma.oppChunk.findMany({
            where: { studentId: student.id, tekst: { contains: "[LEERKRACHT FEEDBACK" } },
            select: { tekst: true },
            orderBy: { id: "desc" },
            take: 5,
          });

          // Step 2: Reflectie ophalen
          send({ type: "step", data: 2 });
          const profileSources = await zoekVolledigProfiel(student.id, focusArea);
          const genSources = [...new Set([...profileSources, ...feedbackChunks.map((c) => c.tekst)])];

          // Step 3: Eerdere opdrachten ophalen
          send({ type: "step", data: 3 });
          const [rejectedChunks, beginsituatieBronnen] = await Promise.all([
            prisma.oppChunk.findMany({
              where: { studentId: student.id, tekst: { contains: "[LEERKRACHT FEEDBACK - afgekeurde opdracht]" } },
              select: { tekst: true },
            }),
            zoekBeginsituatie(student.id),
          ]);
          const rejectedAssignments: RejectedAssignment[] = rejectedChunks.map(({ tekst }) => ({
            title: tekst.match(/Opdrachttitel:\s*"([^"]+)"/)?.[1] ?? "onbekend",
            reason: tekst.match(/Reden van afkeuring:\s*"([^"]+)"/)?.[1] ?? tekst,
          }));
          const beginsituatie = beginsituatieBronnen.join("\n\n").slice(0, 800) || "Geen OPP-informatie beschikbaar.";

          const inferredDateOfBirth = student.dateOfBirth ?? inferDateOfBirthFromSources(genSources);
          if (!student.dateOfBirth && inferredDateOfBirth) {
            await prisma.student.update({ where: { id: student.id }, data: { dateOfBirth: inferredDateOfBirth } });
          }
          const leeftijdLabel = (() => { const a = getStudentAge(inferredDateOfBirth); return a ? `${a} jaar` : "onbekend"; })();
          const interestSnippets = extractProfileInterestsFromSources(genSources);
          const interessesLabel = interestSnippets.length > 0
            ? interestSnippets.map((s) => `"${s}"`).join("; ")
            : "Niet expliciet benoemd in OPP-bronnen";

          // Step 4: Genereren
          send({ type: "step", data: 4 });
          send({ type: "sources", data: genSources });

          const MAX_POGINGEN = 2;
          let poging = 0;
          let parsed: ReturnType<typeof parseGeneratedResponse> | null = null;
          let judgeResult: Awaited<ReturnType<typeof evalueerOpdrachtStreaming>> | null = null;
          let currentAssignmentForGen = currentAssignment;
          let judgeFeedback: string | undefined;

          while (poging < MAX_POGINGEN) {
            poging++;

            const prompt = buildGenerationPrompt({
              student,
              resolvedBloom,
              focusArea,
              estimatedTime,
              sources,
              teacherPrompt,
              currentAssignment: currentAssignmentForGen,
              rejectedAssignments,
              judgeFeedback,
              geschiedenis,
              portfolioInsights,
            });

            await releaseAllOllamaModels();

            parsed = await (async () => {
              try {
                const firstResponse = await ollama.chat({
                  model: GEN_MODEL,
                  messages: [{ role: "user", content: prompt }],
                  tools: [searchOppTool],
                  keep_alive: 0,
                  options: { temperature: 0.3, think: false } as never,
                });

                const messages: { role: string; content: string }[] = [
                  { role: "user", content: prompt },
                  { role: "assistant", content: firstResponse.message.content ?? "" },
                ];

                for (const toolCall of firstResponse.message.tool_calls ?? []) {
                  const { student_id, query } = toolCall.function.arguments;
                  const result = await executeSearchOpp(student_id, query, 3);
                  messages.push({
                    role: "tool",
                    content: typeof result === "string" ? result : JSON.stringify(result),
                  });
                }

                const genResponse = await ollama.chat({
                  model: GEN_MODEL,
                  messages,
                  keep_alive: 0,
                  options: { temperature: 0.3, num_predict: 1500, think: false } as never,
                });

                return parseGeneratedResponse(genResponse.message.content?.trim() ?? "");
              } finally {
                await releaseOllamaModel(GEN_MODEL);
              }
            })();

            send({ type: "assignment", data: { ...parsed, sources } });

            send({ type: "judge_start", data: { total: 7 } });
            try {
              judgeResult = await evalueerOpdrachtStreaming(
                {
                  naam: student.fullName,
                  leeftijd: leeftijdLabel,
                  interesses: interessesLabel,
                  bloomNiveau: resolvedBloom,
                  vak: focusArea || "Algemeen",
                  beginsituatie,
                  gegenereerdeOpdracht: parsed.assignment,
                  volledigOpp: sources.join("\n\n---\n\n"),
                  profielSamenvatting,
                },
                (step) => send({ type: "judge_step", data: step }),
              );
              send({ type: "judge_done", data: judgeResult });
            } catch {
              break;
            }

            if (judgeResult.beslissing !== "opnieuw_genereren") {
              break;
            }

            currentAssignmentForGen = parsed;
            judgeFeedback = buildJudgeFeedback(judgeResult.scores, resolvedBloom);
          }

          controller.close();
        } catch (error) {
          send({
            type: "error",
            data: { message: error instanceof Error ? error.message : "Opdracht genereren mislukt." },
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Opdracht genereren mislukt." },
      { status: 500 },
    );
  }
}
