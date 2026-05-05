export type PortfolioAssignment = {
  title: string;
  bloomLevel: string | null;
  teacherFeedback: { content: string } | null;
};

export type PortfolioInsights = {
  completedCount: number;
  bloomFrequency: Record<string, number>;
  suggestedNextBloom: string | null;
  strugglingAreas: string[];
  successAreas: string[];
  portfolioSummary: string;
};

const BLOOM_ORDER = [
  "Onthouden",
  "Begrijpen",
  "Toepassen",
  "Analyseren",
  "Evalueren",
  "Creëren",
];

const NEGATIVE_KEYWORDS = ["te makkelijk", "moeite", "moeilijk", "meer uitdaging", "niet goed"];
const POSITIVE_KEYWORDS = ["goed gedaan", "uitstekend", "sterk", "prima", "goed gelukt"];

export function analyzePortfolio(assignments: PortfolioAssignment[]): PortfolioInsights {
  if (assignments.length === 0) {
    return {
      completedCount: 0,
      bloomFrequency: {},
      suggestedNextBloom: null,
      strugglingAreas: [],
      successAreas: [],
      portfolioSummary: "",
    };
  }

  const completedCount = assignments.length;

  const bloomFrequency: Record<string, number> = {};
  for (const assignment of assignments) {
    if (assignment.bloomLevel) {
      bloomFrequency[assignment.bloomLevel] = (bloomFrequency[assignment.bloomLevel] ?? 0) + 1;
    }
  }

  // suggestedNextBloom: level after the highest level completed at least 2x
  let suggestedNextBloom: string | null = null;
  for (let i = BLOOM_ORDER.length - 1; i >= 0; i--) {
    const level = BLOOM_ORDER[i];
    if ((bloomFrequency[level] ?? 0) >= 2) {
      const nextIndex = i + 1;
      if (nextIndex < BLOOM_ORDER.length) {
        suggestedNextBloom = BLOOM_ORDER[nextIndex];
      }
      break;
    }
  }

  const strugglingAreas: string[] = [];
  const successAreas: string[] = [];

  for (const assignment of assignments) {
    const feedback = assignment.teacherFeedback?.content?.toLowerCase() ?? "";
    if (!feedback) continue;

    const hasNegative = NEGATIVE_KEYWORDS.some((kw) => feedback.includes(kw));
    const hasPositive = POSITIVE_KEYWORDS.some((kw) => feedback.includes(kw));

    if (hasNegative && !strugglingAreas.includes(assignment.title)) {
      strugglingAreas.push(assignment.title);
    }
    if (hasPositive && !successAreas.includes(assignment.title)) {
      successAreas.push(assignment.title);
    }
  }

  const bloomSummary = Object.entries(bloomFrequency)
    .map(([level, count]) => `${level} (${count}x)`)
    .join(", ");

  let portfolioSummary = `Leerling heeft ${completedCount} opdracht${completedCount === 1 ? "" : "en"} afgerond.`;
  if (bloomSummary) {
    portfolioSummary += ` Bloom-niveaus: ${bloomSummary}.`;
  }
  if (suggestedNextBloom) {
    portfolioSummary += ` Aanbevolen volgend niveau: ${suggestedNextBloom}.`;
  }

  return {
    completedCount,
    bloomFrequency,
    suggestedNextBloom,
    strugglingAreas,
    successAreas,
    portfolioSummary,
  };
}
