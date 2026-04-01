type StudentPresentationProfile = {
  emoji: string;
  interests: string[];
  learningStyle: string;
  workMethod: string;
  concentration: string;
  strengths: string[];
  smartTips: string[];
};

const presentationProfiles: Record<string, StudentPresentationProfile> = {
  "Emma de Vries": {
    emoji: "🚀",
    interests: ["ruimtevaart", "planeten", "experimenten"],
    learningStyle: "Onderzoekend",
    workMethod: "Zelfstandig verkennen",
    concentration: "Hoog",
    strengths: ["onderzoekvaardigheden", "nieuwsgierigheid", "doorzettingsvermogen"],
    smartTips: [
      "Gebruik visuele modellen en simulaties",
      "Werk met open onderzoeksvragen",
      "Geef ruimte voor een eigen hypothese of presentatie",
    ],
  },
  "Julia van Loon": {
    emoji: "👧",
    interests: ["onderzoeken", "presenteren", "tekstanalyse"],
    learningStyle: "Verbaal en analytisch",
    workMethod: "Zelfstandig werken",
    concentration: "Hoog",
    strengths: ["kritisch denken", "taalgevoel", "onderzoekvaardigheden"],
    smartTips: [
      "Laat haar argumenten vergelijken en onderbouwen",
      "Bied ruimte voor presentaties of debat",
      "Gebruik bronnenonderzoek als startpunt",
    ],
  },
  "Noah Bakker": {
    emoji: "🤖",
    interests: ["programmeren", "techniek", "robots"],
    learningStyle: "Visueel en praktisch",
    workMethod: "Ontwerpend leren",
    concentration: "Hoog",
    strengths: ["probleemoplossend denken", "technisch inzicht", "creativiteit"],
    smartTips: [
      "Koppel theorie aan een prototype of ontwerp",
      "Gebruik meerstapsuitdagingen met keuzevrijheid",
      "Laat hem iets bouwen, testen en verbeteren",
    ],
  },
  "Liam Janssen": {
    emoji: "🦊",
    interests: ["natuur", "dieren", "biologie"],
    learningStyle: "Visueel",
    workMethod: "Begeleid zelfstandig",
    concentration: "Gemiddeld",
    strengths: ["observeren", "verbanden leggen", "doorvragen"],
    smartTips: [
      "Werk met beelden, schema's en vergelijkingen",
      "Gebruik concrete onderzoeksvragen",
      "Houd opdrachten compact maar verdiepend",
    ],
  },
  "Sofia Meijer": {
    emoji: "🎨",
    interests: ["creatief schrijven", "verhalen", "kunst"],
    learningStyle: "Creatief en talig",
    workMethod: "Vrije vorm binnen duidelijke kaders",
    concentration: "Hoog",
    strengths: ["creatief denken", "verbeeldingskracht", "reflectie"],
    smartTips: [
      "Laat haar vorm en medium zelf kiezen",
      "Gebruik opdrachten met verhaal of perspectief",
      "Bied ruimte voor reflectie op het eigen werk",
    ],
  },
};

const fallbackProfile: StudentPresentationProfile = {
  emoji: "🧠",
  interests: ["onderzoeken", "creatief denken", "verdiepen"],
  learningStyle: "Visueel",
  workMethod: "Zelfstandig werken",
  concentration: "Hoog",
  strengths: ["kritisch denken", "creativiteit", "zelfregulatie"],
  smartTips: [
    "Werk met open opdrachten en keuzevrijheid",
    "Gebruik bronnen om context en verdieping te geven",
    "Geef ruimte voor presenteren of ontwerpen",
  ],
};

export function getStudentPresentation(name: string): StudentPresentationProfile {
  return presentationProfiles[name] ?? fallbackProfile;
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
  assignments: Array<{ status: "PENDING" | "IN_PROGRESS" | "COMPLETED" }>
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
