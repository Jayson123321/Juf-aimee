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

function bloomToGameMechanic(label: string): string {
  const mechanics: Record<string, string> = {
    "Onthouden":  "Memory/flashcard-mechanic: de speler moet eerder geziene informatie herkennen of terugvinden onder tijdsdruk of druk van obstakels.",
    "Begrijpen":  "Sorteren/matchen: de speler sleept, schiet of plaatst elementen op de juiste plek op basis van begrip van een concept — niet puur geheugen.",
    "Toepassen":  "Puzzel of bouw-mechanic: de speler lost een concreet probleem op door geleerde regels toe te passen (bijv. formules invullen, circuits bouwen, routes plannen).",
    "Analyseren": "Detectie-mechanic: de speler moet fouten, patronen of anomalieën spotten in een stroom van informatie vóór een timer afloopt.",
    "Evalueren":  "Keuze-mechanic: de speler maakt beslissingen die de spelwereld beïnvloeden en ziet de gevolgen — er is geen één goed antwoord, maar betere en slechtere uitkomsten.",
    "Creëren":    "Builder/sandbox: de speler construeert iets (een machine, een stad, een verhaal, een systeem) dat daarna getest of beoordeeld wordt op werkbaarheid.",
  };
  return mechanics[label] ?? "Keuze-mechanic met meerdere gevolgen.";
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

  return `Je bent een professionele browser-game developer. Je maakt een volledig speelbaar HTML5-spel voor een hoogbegaafde basisschoolleerling. Het spel staat in één enkel HTML-bestand, zonder externe libraries of CDN-links — alles inline.

═══════════════════════════════════════════════
LEERLING
═══════════════════════════════════════════════
Naam: ${student.fullName}
Groep: ${student.profile?.currentSchoolYearGroup ?? student.groep ?? "onbekend"}
Schoolvak (= onderwerp van het spel): ${focusArea || "een passend schoolvak"}
Bloom-niveau: ${resolvedBloom}
Speeltijd: ${estimatedTime || "10–15 minuten"}

OPP-PROFIEL — VERPLICHT te gebruiken:
Lees dit profiel volledig. Kies het spelthema, de vijanden/objecten, de verhaalwereld en de moeilijkheidsgraad op basis van wat hier staat over interesses, cognitief niveau, motivatietriggers en beperkingen. Als de leerling bijv. interesse heeft in ruimtevaart → spel speelt zich af in de ruimte. Als de leerling analytisch sterk is → hogere complexiteit. Als de leerling moeite heeft met falen → geen harde bestraffing, maar voortgang-gebaseerde feedback.
${oppBronnen}

LEERLINGGESCHIEDENIS:
${geschiedenis ?? "Geen eerdere opdrachten beschikbaar."}

PORTFOLIO:
${portfolioInsights?.portfolioSummary ?? "Geen eerdere opdrachten beschikbaar."}

INSTRUCTIE LEERKRACHT:
${teacherPrompt || "Maak het spel zo uitdagend en motiverend dat de leerling het écht wil uitspelen."}

${rejectedAssignments?.length
    ? `VERBODEN (niet opnieuw gebruiken):\n${rejectedAssignments.map((r) => `- "${r.title}": ${r.reason}`).join("\n")}`
    : ""}
${judgeFeedback ? `\n${judgeFeedback}\n` : ""}

═══════════════════════════════════════════════
WAT EEN ÉCHT SPEL IS
═══════════════════════════════════════════════
 Spellen waarbij de speler direct controle heeft en iets moet doen, niet alleen lezen of klikken. Een écht spel heeft:

1. GAME LOOP — gebruik requestAnimationFrame(). De wereld beweegt, ook als de speler niets doet.
2. SPELERSCONTROLE — toetsenbord (pijltjestoetsen / WASD / spatiebalk) of muis/touch. De speler stuurt iets.
3. UITDAGING — obstakels, vijanden, tijd, of zwaartekracht. Falen is mogelijk maar leerzaam, niet bestraffend.
4. VOORTGANG — score, levens, levels of een opbouwend systeem. De speler ziet dat hij vordert.
5. VISUELE FEEDBACK — animaties, kleurveranderingen, deeltjeseffecten bij hits of succes. Gebruik canvas of DOM.
6. EDUCATIEVE KERN die ONLOSMAKELIJK in de mechanics zit — niet als quiz tussendoor, maar als de kern van wat je doet om te winnen.

GENRES die goed werken (kies er één):
- Platformer: spring over obstakels die foutieve antwoorden zijn; land op juiste antwoorden
- Runner/avoider: ontwijkt foute elementen, verzamelt juiste
- Tower defense / builder: plaats verdediging op basis van kennis; vijanden breken door als je het fout hebt
- Puzzelspel: schuif, match of roteer stukken op basis van begrip (Sokoban, Tetris-variant, match-3)
- Simulatie: bestuur een systeem (ecosysteem, circuit, economie) met echte gevolgen
- Avontuur/RPG-light: kies dialoogopties of acties op basis van kennis; de wereld reageert

BLOOM-MECHANIC voor dit spel (${resolvedBloom}):
${bloomToGameMechanic(resolvedBloom)}

═══════════════════════════════════════════════
TECHNISCHE EISEN
═══════════════════════════════════════════════
- Eén HTML-bestand, alles inline (geen externe scripts, fonts of images via URL)
- Gebruik <canvas> voor bewegende graphics OF gestylde DOM-elementen met CSS-animaties
- requestAnimationFrame() voor de game loop — geen setInterval voor rendering
- Keyboard én muis/touch ondersteuning waar relevant
- Responsive: werkt op een schermformaat van minimaal 800×600px
- Kleurrijk, aantrekkelijk design — hoogbegaafde kinderen waarderen esthetiek
- Start-scherm met uitleg én een duidelijke startknop
- Game-over/win-scherm met de score en optie om opnieuw te spelen
- Nederlandse tekst in de UI

═══════════════════════════════════════════════
OUTPUT FORMAT (exact zo, niets anders)
═══════════════════════════════════════════════
TITLE: <naam van het spel, max 6 woorden>
GAME_HTML:
<!DOCTYPE html>
<html lang="nl">
...volledig werkend spel...
</html>
RATIONALE:
<Leg in 3–5 zinnen uit: welk genre je koos, hoe de educatieve kern in de gameplay zit, en hoe het aansluit op het OPP-profiel van de leerling.>`;
}
