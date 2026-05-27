import { prisma } from "@/lib/db"
import { getEmbedding } from "@/lib/ollama"
import type { Tool } from "ollama"

export const searchOppTool: Tool = {
  type: "function",
  function: {
    name: "search_opp",
    description: "Search the student's OPP for learning level, interests, goals or attention points.",
    parameters: {
      type: "object",
      properties: {
        student_id: { type: "string" },
        query: { type: "string" },
      },
      required: ["student_id", "query"],
    },
  },
}

// Basis functie — blijft intern
export async function executeSearchOpp(
  studentId: string,
  query: string,
  limit = 3
): Promise<string[]> {
  try {
    const vector = await getEmbedding(query)
    const vectorStr = `[${vector.join(",")}]`

    const results = await prisma.$queryRaw<{ tekst: string; score: number }[]>`
      SELECT tekst, 1 - (embedding <=> ${vectorStr}::vector) as score
      FROM "OppChunk"
      WHERE "studentId" = ${studentId}
      ORDER BY embedding <=> ${vectorStr}::vector
      LIMIT ${limit}
    `

    return results.map((r) => r.tekst.trim()).filter(Boolean)
  } catch {
    // Fallback: keyword search when embedding fails
    const keywords = query.split(/\s+/).filter((w) => w.length > 3).slice(0, 5)
    if (keywords.length === 0) return []

    const results = await prisma.oppChunk.findMany({
      where: {
        studentId,
        OR: keywords.map((kw) => ({ tekst: { contains: kw, mode: "insensitive" as const } })),
      },
      select: { tekst: true },
      take: limit,
    })

    return results.map((r) => r.tekst.trim()).filter(Boolean)
  }
}

// Aparte functie per onderwerp
export async function zoekInteresses(studentId: string) {
  return executeSearchOpp(studentId, "interesses hobby's passies van de leerling", 3)
}

export async function zoekConcreteInteresses(studentId: string) {
  return executeSearchOpp(studentId, "interesse vakken activiteiten hobby gemotiveerd sterk in", 3)
}

export async function zoekIntegratieBeeld(studentId: string) {
  return executeSearchOpp(studentId, "integratief beeld interesse nieuwsgierig passie karakter leerling", 2)
}

export async function zoekBeginsituatie(studentId: string) {
  return executeSearchOpp(studentId, "beginsituatie leerniveau didactische ontwikkeling van de leerling", 3)
}

export async function zoekOnderwijsbehoeften(studentId: string) {
  return executeSearchOpp(studentId, "onderwijsbehoeften werkhouding motivatie autonomie van de leerling", 3)
}

export async function zoekIntelligentieprofiel(studentId: string) {
  return executeSearchOpp(studentId, "intelligentie TIQ cognitief analytisch sterk van de leerling", 3)
}

export async function zoekSchoolvak(studentId: string, focusArea: string) {
  return executeSearchOpp(studentId, focusArea || "schoolvak leerstof", 3)
}

export async function zoekCognitiefProfiel(studentId: string) {
  return executeSearchOpp(studentId, "WISC TIQ IQ uitstroomperspectief VMBO HAVO VWO DLE cognitieve scores", 3)
}

export async function zoekMotivatieEnWerkstijl(studentId: string) {
  return executeSearchOpp(studentId, "motivatietriggers motivatie-afbrekers concentratieboog werkstijl frustratie enthousiasme", 3)
}

export async function zoekPraktischeFactoren(studentId: string) {
  return executeSearchOpp(studentId, "motoriek schrijven zelfredzaamheid planning vaardigheden communicatie sociaal", 3)
}

export async function zoekOndersteuning(studentId: string) {
  return executeSearchOpp(studentId, "hulpverlening HB-coaching RT didactische tips onderwijsbehoefte groeigebieden compacten verrijken", 3)
}

export async function zoekSociaalEmotioneel(studentId: string) {
  return executeSearchOpp(studentId, "SCOL samenwerken welbevinden frustratie presenteren competenties sociaal-emotioneel", 3)
}

export async function zoekHandelingsplanResultaten(studentId: string) {
  return executeSearchOpp(studentId, "handelingsplan doel evaluatie behaald aanpak resultaat leergebied", 5)
}

export async function zoekBevorderendeBelemmerende(studentId: string) {
  return executeSearchOpp(studentId, "bevorderende belemmerende factoren domein motivatie cognitief didactisch sociaal", 3)
}

export async function zoekPraktischeTips(studentId: string) {
  return executeSearchOpp(studentId, "ouders opmerkingen diversen heldere doelen korte evaluaties tips aandachtspunten leerkracht", 3)
}

// Alles in één keer ophalen voor de generator
export async function zoekVolledigProfiel(
  studentId: string,
  focusArea: string
): Promise<string[]> {
  const [interesses, beginsituatie, behoeften, intelligentie, schoolvak, cognitief, motivatie, praktisch, ondersteuning, sociaalEmotioneel, handelingsplan, bevorderend, praktischeTips] =
    await Promise.all([
      zoekInteresses(studentId),
      zoekBeginsituatie(studentId),
      zoekOnderwijsbehoeften(studentId),
      zoekIntelligentieprofiel(studentId),
      zoekSchoolvak(studentId, focusArea),
      zoekCognitiefProfiel(studentId),
      zoekMotivatieEnWerkstijl(studentId),
      zoekPraktischeFactoren(studentId),
      zoekOndersteuning(studentId),
      zoekSociaalEmotioneel(studentId),
      zoekHandelingsplanResultaten(studentId),
      zoekBevorderendeBelemmerende(studentId),
      zoekPraktischeTips(studentId),
    ])

  // Combineer en verwijder duplicaten
  return [...new Set([
    ...interesses,
    ...beginsituatie,
    ...behoeften,
    ...intelligentie,
    ...schoolvak,
    ...cognitief,
    ...motivatie,
    ...praktisch,
    ...ondersteuning,
    ...sociaalEmotioneel,
    ...handelingsplan,
    ...bevorderend,
    ...praktischeTips,
  ])]
}