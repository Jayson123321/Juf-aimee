import type { Tool } from "ollama";
import { prisma } from "@/lib/db";

export const getStudentAssignmentsTool: Tool = {
  type: "function",
  function: {
    name: "get_student_assignments",
    description: "Haalt recente opdrachten op voor een leerling.",
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

export const saveAssignmentTool: Tool = {
  type: "function",
  function: {
    name: "save_assignment",
    description: "Sla een gegenereerde opdracht op in de database voor een leerling.",
    parameters: {
      type: "object",
      properties: {
        leerling_id: { type: "string", description: "Het ID van de leerling" },
        tekst: { type: "string", description: "De volledige opdrachttekst" },
        bloom_niveau: { type: "number", description: "Bloom-niveau (1-6)" },
        bloom_naam: {
          type: "string",
          description: "Naam van het Bloom-niveau, bijv. 'Toepassen'",
        },
        uitleg: {
          type: "string",
          description: "Uitleg over waarom deze opdracht past bij de leerling",
        },
      },
      required: ["leerling_id", "tekst", "bloom_niveau", "bloom_naam", "uitleg"],
    },
  },
};

export const updateBloomLevelTool: Tool = {
  type: "function",
  function: {
    name: "update_bloom_level",
    description: "Werk het Bloom-niveau van een leerling bij naar een nieuw niveau.",
    parameters: {
      type: "object",
      properties: {
        leerling_id: { type: "string", description: "Het ID van de leerling" },
        bloom_niveau: { type: "number", description: "Nieuw Bloom-niveau (1-6)" },
      },
      required: ["leerling_id", "bloom_niveau"],
    },
  },
};

export async function executeGetStudentAssignments(leerlingId: string): Promise<string> {
  const assignments = await prisma.assignment.findMany({
    where: { studentId: leerlingId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      subject: true,
    },
  });

  if (assignments.length === 0) return "Geen opdrachten gevonden voor deze leerling.";

  return assignments
    .map(
      (assignment) =>
        `[${assignment.bloomLevel ?? "Onbekend"}]\n${assignment.title}\n${
          assignment.description ?? "Geen beschrijving beschikbaar."
        }\nVak: ${assignment.subject?.name ?? "Onbekend"}`
    )
    .join("\n\n---\n\n");
}

export async function executeSaveAssignment(args: {
  leerling_id: string;
  tekst: string;
  bloom_niveau: number;
  bloom_naam: string;
  uitleg: string;
}): Promise<string> {
  const title = args.tekst.split("\n")[0]?.slice(0, 80).trim() || "AI gegenereerde opdracht";

  const assignment = await prisma.assignment.create({
    data: {
      studentId: args.leerling_id,
      title,
      description: args.tekst,
      bloomNiveau: args.bloom_niveau,
      bloomLevel: args.bloom_naam,
      uitleg: args.uitleg,
    },
  });

  return `Opdracht opgeslagen met ID ${assignment.id}.`;
}

export async function executeUpdateBloomLevel(
  leerlingId: string,
  bloomNiveau: number
): Promise<string> {
  if (bloomNiveau < 1 || bloomNiveau > 6) {
    return "Ongeldig Bloom-niveau. Moet tussen 1 en 6 zijn.";
  }

  await prisma.student.update({
    where: { id: leerlingId },
    data: { bloomNiveau },
  });

  return `Bloom-niveau van leerling ${leerlingId} bijgewerkt naar niveau ${bloomNiveau}.`;
}
