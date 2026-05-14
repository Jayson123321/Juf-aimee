import type { PortfolioInsights } from "@/lib/portfolio-analysis";

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

function bloomVerbGuide(label: string): string {
  const guides: Record<string, string> = {
    "Onthouden": "herinneren, benoemen, opsommen, herkennen — de leerling reproduceert informatie",
    "Begrijpen": "uitleggen, samenvatten, vergelijken, classificeren — de leerling toont begrip van de stof",
    "Toepassen": "gebruiken, uitvoeren, berekenen, oplossen — de leerling past aangeleerde kennis toe in een nieuwe situatie",
    "Analyseren": "onderbouwen, vergelijken, differentiëren, onderzoeken — de leerling breekt informatie op in onderdelen",
    "Evalueren": "beoordelen, verdedigen, bekritiseren, rechtvaardigen — de leerling geeft een onderbouwd oordeel over iets",
    "Creëren": "ontwerpen, construeren, samenstellen, schrijven, plannen — de leerling MAAKT iets nieuws dat nog niet bestond",
  };
  return guides[label] ?? `past bij Bloom-niveau ${label}`;
}

export function generateGamePrompt(args: {
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
  const {
    student,
    resolvedBloom,
    focusArea,
    estimatedTime,
    sources,
    teacherPrompt,
    rejectedAssignments,
    judgeFeedback,
    geschiedenis,
    portfolioInsights,
  } = args;

  const oppBronnen = sources.length > 0
    ? sources.join("\n\n---\n\n")
    : "Geen OPP-informatie beschikbaar.";

  return `Je bent een game developer gespecialiseerd in onderwijs voor hoogbegaafde kinderen.

Maak een volledig speelbaar browserspel als één HTML-bestand voor ${student.fullName} (groep ${student.profile?.currentSchoolYearGroup ?? student.groep ?? "onbekend"}). Het spel gaat over ${focusArea || "een passend schoolvak"} op Bloom-niveau "${resolvedBloom}" (${bloomVerbGuide(resolvedBloom)}). De geschatte speeltijd is ${estimatedTime || "niet opgegeven"}.

De leerling moet het gevoel hebben dat zijn keuzes ertoe doen — dat hij invloed heeft op de spelwereld en dat het misgaat als hij niet oplet. Denk aan: iets bouwen en verdedigen, een probleem oplossen onder tijdsdruk, navigeren met obstakels, een systeem in balans houden. Passief klikken om content te ontdekken is geen spel.

Hoogbegaafde kinderen zijn het meest gemotiveerd door cognitief uitdagende spelvormen met diepgang — puzzels, strategie, bouwen, avontuur. Ze spelen graag op hun eigen tempo en in hun eigen stijl. Ze kunnen slecht tegen verlies, dus vermijd puur competitieve scoring: gebruik coöperatieve mechanics of persoonlijke voortgang als beloning. Maak falen leerzaam, niet bestraffend.

Stem het thema, de voorbeelden en de moeilijkheidsgraad volledig af op het profiel van de leerling hieronder. Gebruik geen externe libraries — alles inline in één HTML-bestand.

OPP-PROFIEL:
${oppBronnen}

INSTRUCTIE LEERKRACHT:
${teacherPrompt || "Genereer een uitdagend en motiverend spel dat de leerling écht wil uitspelen."}

LEERLINGGESCHIEDENIS:
${geschiedenis ?? "Geen eerdere opdrachten beschikbaar."}

PORTFOLIO:
${portfolioInsights?.portfolioSummary
    ? `${portfolioInsights.portfolioSummary}${portfolioInsights.suggestedNextBloom ? `\nAanbevolen Bloom-niveau: ${portfolioInsights.suggestedNextBloom}` : ""}`
    : "Geen eerdere opdrachten beschikbaar."}

${rejectedAssignments?.length
    ? `Maak geen spel dat lijkt op de volgende afgekeurde opdrachten:\n${rejectedAssignments.map((r) => `- "${r.title}": ${r.reason}`).join("\n")}`
    : ""}
${judgeFeedback ? `\n${judgeFeedback}\n` : ""}

Geef ALLEEN dit terug:

TITLE: <titel van het spel>
GAME_HTML:
<!DOCTYPE html>
<html lang="nl">
...volledig zelfstandig HTML/CSS/JS spel...
</html>
RATIONALE:
<Beschrijf waarom dit spel past bij de leerling: het gekozen genre, het Bloom-niveau in de gameplay, en hoe het thema aansluit op het OPP-profiel.>`;
}
