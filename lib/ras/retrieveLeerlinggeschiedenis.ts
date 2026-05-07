import { prisma } from "@/lib/db"

export type LeerlinggeschiedenisItem = {
  title: string
  bloomLevel: string | null
  studentWork: string | null
  teacherFeedback: { content: string } | null
  reflection: { content: string } | null
  submissions: { fileName: string }[]
}

export async function retrieveLeerlinggeschiedenis(
  studentId: string,
  take = 5
): Promise<LeerlinggeschiedenisItem[]> {
  return prisma.assignment.findMany({
    where: { studentId, status: "COMPLETED" },
    select: {
      title: true,
      bloomLevel: true,
      studentWork: true,
      teacherFeedback: { select: { content: true } },
      reflection: { select: { content: true } },
      submissions: { select: { fileName: true } },
    },
    orderBy: { updatedAt: "desc" },
    take,
  })
}

export function formatLeerlinggeschiedenis(geschiedenis: LeerlinggeschiedenisItem[]): string {
  if (geschiedenis.length === 0) return "Geen eerdere opdrachten beschikbaar."

  return geschiedenis
    .map((a) => {
      const lines = [`Opdracht: "${a.title}" (Bloom: ${a.bloomLevel ?? "onbekend"})`]

      if (a.studentWork?.trim()) {
        lines.push(`  Ingeleverd werk: ${a.studentWork.trim()}`)
      }

      for (const sub of a.submissions) {
        lines.push(`  Ingestuurd bestand: ${sub.fileName}`)
      }

      if (a.teacherFeedback?.content) {
        lines.push(`  Feedback leraar: ${a.teacherFeedback.content}`)
      }

      if (a.reflection?.content) {
        lines.push(`  Reflectie leerling: ${a.reflection.content}`)
      }

      return lines.join("\n")
    })
    .join("\n\n")
}
