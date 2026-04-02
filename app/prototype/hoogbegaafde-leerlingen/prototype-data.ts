export type PrototypeBloomLevel =
  | "Onthouden"
  | "Begrijpen"
  | "Toepassen"
  | "Analyseren"
  | "Evalueren"
  | "Creeren";

export type PrototypeSubjectScore = {
  subject: string;
  currentScore: number;
  bloomLevel: PrototypeBloomLevel;
  trend: "up" | "down" | "steady";
  lastAssessment: string;
};

export type PrototypeAssignment = {
  id: string;
  studentId: string;
  title: string;
  description: string;
  rationale: string;
  feedback?: string;
  bloomLevel: PrototypeBloomLevel;
  status: "completed" | "in_progress" | "not_started";
  createdAt: string;
};

export type PrototypeStudent = {
  id: string;
  name: string;
  age: number;
  emoji: string;
  interests: string[];
  progress: number;
  status: PrototypeBloomLevel;
  badgeEmoji: string;
  completedAssignments: number;
  totalAssignments: number;
  learningStyle: string;
  workMethod: string;
  concentration: string;
  motivationFactors: string[];
  strengths: string[];
  supportNeeds: string[];
  didacticTips: string[];
  currentTeacher: string;
  schoolYear: string;
  avatarLabel: string;
  profileSummary: string;
  subjectScores: PrototypeSubjectScore[];
};

export const prototypeDashboardStats = {
  averageProgress: 83,
  bloomCounts: [
    { label: "Toepassen", count: 1 },
    { label: "Analyseren", count: 1 },
    { label: "Evalueren", count: 1 },
    { label: "Creeren", count: 1 },
  ],
  topInterests: [
    { label: "techniek", count: 2 },
    { label: "onderzoeken", count: 1 },
    { label: "presenteren", count: 1 },
    { label: "tekstanalyse", count: 1 },
  ],
  longRunningAssignments: 2,
  totalStudents: 4,
  activeAssignments: 2,
  completedAssignments: 1,
  aiAssignments: 6,
} as const;

export const prototypeStudents: PrototypeStudent[] = [
  {
    id: "julia-van-loon",
    name: "Julia van Loon",
    age: 10,
    emoji: "\uD83D\uDC67",
    avatarLabel: "JV",
    interests: ["onderzoeken", "presenteren", "tekstanalyse"],
    progress: 88,
    status: "Evalueren",
    badgeEmoji: "\u2696\uFE0F",
    completedAssignments: 0,
    totalAssignments: 2,
    learningStyle: "visueel",
    workMethod: "zelfstandig werken",
    concentration: "lang",
    motivationFactors: ["Autonomie", "Complexiteit", "Verdieping"],
    strengths: ["kritisch denken", "taalgevoel", "onderzoekvaardigheden"],
    supportNeeds: ["expliciete succescriteria", "ruimte voor eigen invalshoek"],
    didacticTips: [
      "Gebruik visuele hulpmiddelen (schema's, diagrammen, afbeeldingen)",
      "Bied complexe, lange-termijn projecten aan",
      "Moedig imperfecte pogingen aan - proces boven resultaat",
    ],
    currentTeacher: "Mevr. De Boer",
    schoolYear: "Groep 7",
    profileSummary:
      "Sterk taalgericht profiel met behoefte aan diepgang, autonomie en open onderzoeksopdrachten.",
    subjectScores: [
      {
        subject: "Taal",
        currentScore: 9.4,
        bloomLevel: "Evalueren",
        trend: "up",
        lastAssessment: "2026-03-20",
      },
      {
        subject: "Wereldorientatie",
        currentScore: 9.1,
        bloomLevel: "Analyseren",
        trend: "steady",
        lastAssessment: "2026-03-15",
      },
      {
        subject: "Presenteren",
        currentScore: 8.9,
        bloomLevel: "Creeren",
        trend: "up",
        lastAssessment: "2026-03-11",
      },
    ],
  },
  {
    id: "milan-de-groot",
    name: "Milan de Groot",
    age: 10,
    emoji: "\uD83D\uDC66",
    avatarLabel: "MG",
    interests: ["programmeren", "techniek", "wiskunde", "ontwerpen"],
    progress: 90,
    status: "Creeren",
    badgeEmoji: "\u2728",
    completedAssignments: 1,
    totalAssignments: 2,
    learningStyle: "praktisch",
    workMethod: "ontwerpend leren",
    concentration: "lang",
    motivationFactors: ["Experimenteren", "Zelf bouwen", "Problemen oplossen"],
    strengths: ["technisch inzicht", "creativiteit", "doorzetten"],
    supportNeeds: ["reflectie op keuzes", "duidelijke ontwerpstappen"],
    didacticTips: [
      "Laat de leerling iets bouwen, testen en verbeteren",
      "Werk met open ontwerpvragen en prototypes",
      "Bied verdieping via techniek en programmeeropdrachten",
    ],
    currentTeacher: "Dhr. Kramer",
    schoolYear: "Groep 7",
    profileSummary:
      "Sterk technisch profiel met hoge motivatie bij ontwerpen, programmeren en iteratief verbeteren.",
    subjectScores: [
      {
        subject: "Rekenen",
        currentScore: 9.2,
        bloomLevel: "Analyseren",
        trend: "up",
        lastAssessment: "2026-03-18",
      },
      {
        subject: "Techniek",
        currentScore: 9.6,
        bloomLevel: "Creeren",
        trend: "up",
        lastAssessment: "2026-03-22",
      },
      {
        subject: "Programmeren",
        currentScore: 9.3,
        bloomLevel: "Creeren",
        trend: "steady",
        lastAssessment: "2026-03-14",
      },
    ],
  },
  {
    id: "sophie-meijer",
    name: "Sophie Meijer",
    age: 9,
    emoji: "\uD83D\uDC67",
    avatarLabel: "SM",
    interests: ["creatief schrijven", "verhalen", "lezen"],
    progress: 32,
    status: "Toepassen",
    badgeEmoji: "\uD83C\uDFAF",
    completedAssignments: 0,
    totalAssignments: 1,
    learningStyle: "talig",
    workMethod: "vrije vorm",
    concentration: "gemiddeld",
    motivationFactors: ["Expressie", "Verhalen", "Keuzevrijheid"],
    strengths: ["verbeeldingskracht", "reflectie", "taalproductie"],
    supportNeeds: ["kortere feedbacklussen", "structuur in planning"],
    didacticTips: [
      "Laat vorm en medium deels vrij kiezen",
      "Gebruik rijke, open schrijfopdrachten",
      "Bied reflectiemomenten tijdens het werken",
    ],
    currentTeacher: "Mevr. Van Dam",
    schoolYear: "Groep 6",
    profileSummary:
      "Creatief taalprofiel met veel ideeproductie; gebaat bij vrijheid binnen duidelijke kaders.",
    subjectScores: [
      {
        subject: "Taal",
        currentScore: 8.8,
        bloomLevel: "Toepassen",
        trend: "steady",
        lastAssessment: "2026-03-19",
      },
      {
        subject: "Lezen",
        currentScore: 8.5,
        bloomLevel: "Begrijpen",
        trend: "up",
        lastAssessment: "2026-03-17",
      },
      {
        subject: "Creatief schrijven",
        currentScore: 9.1,
        bloomLevel: "Creeren",
        trend: "up",
        lastAssessment: "2026-03-12",
      },
    ],
  },
  {
    id: "daan-verbeek",
    name: "Daan Verbeek",
    age: 9,
    emoji: "\uD83D\uDC66",
    avatarLabel: "DV",
    interests: ["natuurkunde", "bouwen", "strategie", "techniek"],
    progress: 72,
    status: "Analyseren",
    badgeEmoji: "\uD83D\uDD0E",
    completedAssignments: 0,
    totalAssignments: 1,
    learningStyle: "onderzoekend",
    workMethod: "stapsgewijs werken",
    concentration: "gemiddeld",
    motivationFactors: ["Ontdekken", "Patronen vinden", "Strategie"],
    strengths: ["onderbouwd redeneren", "verbanden zien", "doorvragen"],
    supportNeeds: ["heldere tussenstappen", "visuele planning"],
    didacticTips: [
      "Werk met onderzoeksvragen en hypothesen",
      "Laat oplossingen vergelijken en onderbouwen",
      "Gebruik bouw- en strategie-elementen om aandacht vast te houden",
    ],
    currentTeacher: "Dhr. Peters",
    schoolYear: "Groep 6",
    profileSummary:
      "Onderzoekend profiel met voorkeur voor strategie, logica en natuurkundige toepassingen.",
    subjectScores: [
      {
        subject: "Rekenen",
        currentScore: 8.7,
        bloomLevel: "Analyseren",
        trend: "up",
        lastAssessment: "2026-03-16",
      },
      {
        subject: "Techniek",
        currentScore: 8.9,
        bloomLevel: "Toepassen",
        trend: "steady",
        lastAssessment: "2026-03-13",
      },
      {
        subject: "Natuurkunde",
        currentScore: 9.0,
        bloomLevel: "Analyseren",
        trend: "up",
        lastAssessment: "2026-03-21",
      },
    ],
  },
];

export const prototypeAssignments: PrototypeAssignment[] = [
  {
    id: "assignment-1",
    studentId: "julia-van-loon",
    title: "Onderzoek de invloed van nieuwsbronnen",
    description:
      "Vergelijk drie nieuwsartikelen over hetzelfde onderwerp en beoordeel verschillen in toon, brongebruik en argumentatie.",
    rationale:
      "Sluit aan op Julia's interesse in onderzoeken en tekstanalyse en daagt haar uit op evaluatieniveau.",
    feedback:
      "Julia werkte zelfstandig en onderbouwde haar keuzes goed. Volgende stap: explicieter bronbetrouwbaarheid meenemen.",
    bloomLevel: "Evalueren",
    status: "in_progress",
    createdAt: "2026-03-24",
  },
  {
    id: "assignment-2",
    studentId: "julia-van-loon",
    title: "Presenteer een eigen stelling met bronnen",
    description:
      "Bereid een korte pitch voor waarin je een eigen standpunt verdedigt met behulp van minimaal twee bronnen.",
    rationale:
      "Combineert presenteren met kritisch denken en geeft ruimte voor autonomie in onderwerpkeuze.",
    bloomLevel: "Creeren",
    status: "not_started",
    createdAt: "2026-03-27",
  },
  {
    id: "assignment-3",
    studentId: "milan-de-groot",
    title: "Ontwerp een slimme sorteermachine",
    description:
      "Bedenk en schets een machine die voorwerpen automatisch sorteert en licht je programmeerlogica toe.",
    rationale:
      "Past bij Milan's technische interesses en stimuleert creeren door ontwerpen en bouwen te combineren.",
    feedback:
      "Sterk concept en goede logica. Volgende keer nog beter motiveren waarom deze oplossing het meest efficient is.",
    bloomLevel: "Creeren",
    status: "completed",
    createdAt: "2026-03-18",
  },
  {
    id: "assignment-4",
    studentId: "milan-de-groot",
    title: "Programmeer een wiskundige puzzel",
    description:
      "Maak een interactieve puzzel waarin de gebruiker patronen moet herkennen en de uitkomst moet voorspellen.",
    rationale:
      "Verbindt programmeren en wiskunde en sluit aan bij Milan's behoefte aan complexe uitdagingen.",
    bloomLevel: "Analyseren",
    status: "in_progress",
    createdAt: "2026-03-26",
  },
  {
    id: "assignment-5",
    studentId: "sophie-meijer",
    title: "Schrijf een verhaal vanuit twee perspectieven",
    description:
      "Kies een gebeurtenis en schrijf twee korte versies van hetzelfde verhaal vanuit verschillende personages.",
    rationale:
      "Geeft Sophie creatieve ruimte en helpt haar taalvaardigheid toepassen in een betekenisvolle opdracht.",
    bloomLevel: "Toepassen",
    status: "not_started",
    createdAt: "2026-03-22",
  },
  {
    id: "assignment-6",
    studentId: "daan-verbeek",
    title: "Analyseer waarom bruggen sterk zijn",
    description:
      "Onderzoek verschillende brugconstructies en leg uit welke krachten er werken in elk ontwerp.",
    rationale:
      "Sluit aan op Daan's interesse in bouwen en strategie en daagt hem uit om verbanden te analyseren.",
    bloomLevel: "Analyseren",
    status: "in_progress",
    createdAt: "2026-03-25",
  },
];

export const bloomOptions: PrototypeBloomLevel[] = [
  "Onthouden",
  "Begrijpen",
  "Toepassen",
  "Analyseren",
  "Evalueren",
  "Creeren",
];

export function getPrototypeStudent(studentId: string) {
  return prototypeStudents.find((student) => student.id === studentId);
}

export function getPrototypeAssignments(studentId: string) {
  return prototypeAssignments.filter((assignment) => assignment.studentId === studentId);
}
