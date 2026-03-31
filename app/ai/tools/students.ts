import type { Tool } from "ollama"
import { prisma } from "@/lib/db"

export const listStudentsTool: Tool = {
  type: "function",
  function: {
    name: "list_students",
    description: "Geeft een lijst van alle leerlingen terug met hun ID, naam, groep en Bloom-niveau.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
}

export const getStudentInfoTool: Tool = {
  type: "function",
  function: {
    name: "get_student_info",
    description: "Geeft gedetailleerde informatie over één leerling op basis van hun ID, inclusief recente opdrachten.",
    parameters: {
      type: "object",
      properties: {
        leerling_id: {
          type: "number",
          description: "Het ID van de leerling",
        },
      },
      required: ["leerling_id"],
    },
  },
}

export async function executeListStudents(): Promise<string> {
  const students = await prisma.leerling.findMany({
    select: { id: true, naam: true, groep: true, bloomNiveau: true },
    orderBy: { naam: "asc" },
  })

  if (students.length === 0) return "Er zijn geen leerlingen gevonden."

  return students
    .map((s) => `ID: ${s.id} | ${s.naam} | Groep ${s.groep} | Bloom niveau ${s.bloomNiveau}`)
    .join("\n")
}

export async function executeGetStudentInfo(leerlingId: number): Promise<string> {
  const student = await prisma.leerling.findUnique({
    where: { id: leerlingId },
    include: {
      opdrachten: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  })

  if (!student) return `Geen leerling gevonden met ID ${leerlingId}.`

  const recent =
    student.opdrachten.length > 0
      ? student.opdrachten
          .map((o) => `  - ${o.bloomNaam} (niveau ${o.bloomNiveau}): ${o.tekst.slice(0, 80)}...`)
          .join("\n")
      : "  Nog geen opdrachten."

  return `Naam: ${student.naam}\nGroep: ${student.groep}\nBloom niveau: ${student.bloomNiveau}\nRecentste opdrachten:\n${recent}`
}
