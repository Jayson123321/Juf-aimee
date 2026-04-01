import type { Tool } from "ollama";
import { prisma } from "@/lib/db";

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
};

export const getStudentInfoTool: Tool = {
  type: "function",
  function: {
    name: "get_student_info",
    description: "Geeft gedetailleerde informatie over één leerling op basis van hun ID.",
    parameters: {
      type: "object",
      properties: {
        leerling_id: {
          type: "string",
          description: "Het ID van de leerling",
        },
      },
      required: ["leerling_id"],
    },
  },
};

export async function executeListStudents(): Promise<string> {
  const students = await prisma.student.findMany({
    select: { id: true, fullName: true, groep: true, bloomNiveau: true },
    orderBy: { fullName: "asc" },
  });

  if (students.length === 0) return "Er zijn geen leerlingen gevonden.";

  return students
    .map(
      (student) =>
        `ID: ${student.id} | ${student.fullName} | Groep ${student.groep ?? "Onbekend"} | Bloom niveau ${student.bloomNiveau}`
    )
    .join("\n");
}

export async function executeGetStudentInfo(leerlingId: string): Promise<string> {
  const student = await prisma.student.findUnique({
    where: { id: leerlingId },
    include: {
      assignments: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });

  if (!student) return `Geen leerling gevonden met ID ${leerlingId}.`;

  const recent =
    student.assignments.length > 0
      ? student.assignments
          .map(
            (assignment) =>
              `  - ${assignment.title} (${assignment.bloomLevel ?? "geen Bloom label"})`
          )
          .join("\n")
      : "  Nog geen opdrachten.";

  return `Naam: ${student.fullName}\nGroep: ${student.groep ?? "Onbekend"}\nBloom niveau: ${
    student.bloomNiveau
  }\nRecente opdrachten:\n${recent}`;
}
