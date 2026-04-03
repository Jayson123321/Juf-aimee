type StudentPresentationProfile = {
  emoji: string;
  interests: string[];
  learningStyle: string;
  workMethod: string;
  concentration: string;
  strengths: string[];
  smartTips: string[];
};

type DeriveStudentPresentationInput = {
  fullName: string;
  schoolHistory?: string | null;
  assignments?: Array<{
    title?: string | null;
    description?: string | null;
    uitleg?: string | null;
    bloomLevel?: string | null;
  }>;
  oppTexts?: string[] | string;
};

const INTEREST_CATALOG = [
  { label: "onderzoeken", terms: ["onderzoek", "onderzoeken", "bronnen", "onderzoeksvraag"] },
  { label: "presenteren", terms: ["presentatie", "presenteren", "uitleggen", "debat"] },
  { label: "tekstanalyse", terms: ["tekst", "tekstanalyse", "taal", "lezen", "schrijven"] },
  { label: "programmeren", terms: ["programmeren", "code", "coderen", "software"] },
  { label: "techniek", terms: ["techniek", "technisch", "robot", "constructie"] },
  { label: "wiskunde", terms: ["wiskunde", "rekenen", "getallen", "meetkunde"] },
  { label: "ontwerpen", terms: ["ontwerpen", "ontwerp", "maken", "creëren"] },
  { label: "creatief schrijven", terms: ["creatief schrijven", "verhalen", "gedicht", "schrijven"] },
  { label: "natuurkunde", terms: ["natuurkunde", "proef", "experiment", "energie"] },
  { label: "bouwen", terms: ["bouwen", "constructie", "maquette", "ontwerp"] },
  { label: "strategie", terms: ["strategie", "plan", "analyseren", "verbanden"] },
] as const;

function normalizeText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function buildContextText(input: DeriveStudentPresentationInput) {
  const assignmentText = (input.assignments ?? [])
    .flatMap((assignment) => [
      assignment.title ?? "",
      assignment.description ?? "",
      assignment.uitleg ?? "",
      assignment.bloomLevel ?? "",
    ])
    .join(" ");

  const oppText = Array.isArray(input.oppTexts) ? input.oppTexts.join(" ") : input.oppTexts ?? "";

  return normalizeText([input.schoolHistory ?? "", assignmentText, oppText].join(" "));
}

function deriveEmoji(fullName: string) {
  const emojiSet = ["🧑", "👧", "👦", "🧠", "🌟"];
  const hash = [...fullName].reduce((total, char) => total + char.charCodeAt(0), 0);
  return emojiSet[hash % emojiSet.length];
}

function deriveInterests(contextText: string) {
  const scored = INTEREST_CATALOG.map((entry) => ({
    label: entry.label,
    score: entry.terms.reduce(
      (total, term) => total + (contextText.includes(normalizeText(term)) ? 1 : 0),
      0,
    ),
  }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.label);

  return scored.length > 0 ? scored : ["verdiepen", "onderzoeken", "leren"];
}

function deriveLearningStyle(contextText: string, interests: string[]) {
  if (
    contextText.includes("visueel") ||
    interests.some((interest) => ["programmeren", "techniek", "wiskunde", "ontwerpen"].includes(interest))
  ) {
    return "Visueel en praktisch";
  }

  if (
    contextText.includes("taal") ||
    contextText.includes("verbaal") ||
    interests.some((interest) =>
      ["presenteren", "tekstanalyse", "creatief schrijven"].includes(interest),
    )
  ) {
    return "Talig en analytisch";
  }

  return "Onderzoekend en zelfstandig";
}

function deriveWorkMethod(contextText: string, interests: string[]) {
  if (contextText.includes("zelfstandig")) return "Zelfstandig werken";
  if (contextText.includes("samenwerken")) return "Samenwerkend leren";
  if (interests.some((interest) => ["techniek", "ontwerpen", "programmeren"].includes(interest))) {
    return "Ontwerpend leren";
  }
  return "Stapsgewijs werken";
}

function deriveConcentration(contextText: string) {
  if (contextText.includes("hoge concentratie") || contextText.includes("lange concentratie")) {
    return "Hoog";
  }
  if (contextText.includes("korte concentratie")) return "Kort";
  return "Gemiddeld";
}

function deriveStrengths(interests: string[], learningStyle: string) {
  const strengths = new Set<string>();

  if (interests.includes("onderzoeken")) strengths.add("onderzoekvaardigheden");
  if (interests.includes("presenteren")) strengths.add("mondelinge uitleg");
  if (interests.includes("tekstanalyse")) strengths.add("taalgevoel");
  if (interests.includes("programmeren") || interests.includes("techniek")) {
    strengths.add("probleemoplossend denken");
  }
  if (interests.includes("ontwerpen") || interests.includes("creatief schrijven")) {
    strengths.add("creatief denken");
  }
  if (learningStyle.includes("analytisch")) strengths.add("kritisch denken");
  if (learningStyle.includes("praktisch")) strengths.add("toepassen in stappen");

  return [...strengths].slice(0, 3).length > 0
    ? [...strengths].slice(0, 3)
    : ["zelfstandig werken", "doorvragen", "nieuwsgierigheid"];
}

function deriveSmartTips(
  interests: string[],
  learningStyle: string,
  workMethod: string,
): string[] {
  const tips: string[] = [];

  if (learningStyle.includes("Visueel")) {
    tips.push("Gebruik schema's, voorbeelden en visuele tussenstappen");
  }
  if (learningStyle.includes("Talig")) {
    tips.push("Laat de leerling eerst hardop of schrijvend uitleggen wat al bekend is");
  }
  if (interests.includes("onderzoeken")) {
    tips.push("Start met een duidelijke onderzoeksvraag en laat bronnen vergelijken");
  }
  if (workMethod.includes("Zelfstandig")) {
    tips.push("Geef een heldere start en daarna ruimte voor eigen keuzes");
  }

  return tips.slice(0, 3).length > 0
    ? tips.slice(0, 3)
    : [
        "Werk in kleine stappen met een duidelijk doel",
        "Laat de leerling eerst voorkennis ophalen",
        "Sluit af met een korte reflectie op het werk",
      ];
}

export function deriveStudentPresentation(
  input: DeriveStudentPresentationInput,
): StudentPresentationProfile {
  const contextText = buildContextText(input);
  const interests = deriveInterests(contextText);
  const learningStyle = deriveLearningStyle(contextText, interests);
  const workMethod = deriveWorkMethod(contextText, interests);
  const concentration = deriveConcentration(contextText);
  const strengths = deriveStrengths(interests, learningStyle);

  return {
    emoji: deriveEmoji(input.fullName),
    interests,
    learningStyle,
    workMethod,
    concentration,
    strengths,
    smartTips: deriveSmartTips(interests, learningStyle, workMethod),
  };
}

export function getBloomLevelLabel(level?: number | null): string {
  switch (level) {
    case 1:
      return "Onthouden";
    case 2:
      return "Begrijpen";
    case 3:
      return "Toepassen";
    case 4:
      return "Analyseren";
    case 5:
      return "Evalueren";
    case 6:
      return "Creëren";
    default:
      return "Toepassen";
  }
}

export function getBloomAppearance(label: string) {
  switch (label) {
    case "Evalueren":
      return {
        badgeClassName: "bg-gray-100 text-gray-700",
        badgeEmoji: "⚖️",
      };
    case "Creëren":
      return {
        badgeClassName: "bg-blue-50 text-blue-700",
        badgeEmoji: "💡",
      };
    case "Toepassen":
      return {
        badgeClassName: "bg-green-50 text-green-700",
        badgeEmoji: "✅",
      };
    case "Analyseren":
      return {
        badgeClassName: "bg-amber-50 text-amber-700",
        badgeEmoji: "🔍",
      };
    case "Begrijpen":
      return {
        badgeClassName: "bg-purple-50 text-purple-700",
        badgeEmoji: "📘",
      };
    default:
      return {
        badgeClassName: "bg-slate-100 text-slate-700",
        badgeEmoji: "🧩",
      };
  }
}

export function calculateStudentProgress(
  assignments: Array<{ status: "PENDING" | "IN_PROGRESS" | "COMPLETED" }>,
): number {
  if (assignments.length === 0) return 0;

  const score = assignments.reduce((total, assignment) => {
    if (assignment.status === "COMPLETED") return total + 1;
    if (assignment.status === "IN_PROGRESS") return total + 0.5;
    return total;
  }, 0);

  return Math.round((score / assignments.length) * 100);
}

export function getStudentAge(dateOfBirth?: Date | null): number | null {
  if (!dateOfBirth) return null;

  const now = new Date();
  let age = now.getFullYear() - dateOfBirth.getFullYear();
  const beforeBirthday =
    now.getMonth() < dateOfBirth.getMonth() ||
    (now.getMonth() === dateOfBirth.getMonth() && now.getDate() < dateOfBirth.getDate());

  if (beforeBirthday) age -= 1;
  return age;
}
