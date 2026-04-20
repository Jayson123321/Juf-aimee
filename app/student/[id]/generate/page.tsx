import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import {
  deriveStudentPresentation,
  getBloomLevelLabel,
  getStudentAge,
} from "@/lib/student-profile";
import { AssignmentGenerateClient } from "./AssignmentGenerateClient";

export const dynamic = "force-dynamic";

export default async function AssignmentGenerationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      assignments: {
        include: {
          subject: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
      },
      profile: true,
      oppChunks: {
        select: {
          tekst: true,
        },
        take: 12,
      },
    },
  });

  if (!student) notFound();

  const presentation = deriveStudentPresentation({
    fullName: student.fullName,
    schoolHistory: student.profile?.schoolHistory,
    assignments: student.assignments,
    oppTexts: student.oppChunks.map((chunk) => chunk.tekst),
  });
  const bloomLevel = getBloomLevelLabel(student.bloomNiveau);
  const age = getStudentAge(student.dateOfBirth);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl space-y-6 p-8">
        <Link
          className="inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-gray-800"
          href={`/student/${id}`}
        >
          <ArrowLeft className="size-4" />
          Terug naar profiel
        </Link>

        <AssignmentGenerateClient
          student={{
            id,
            fullName: student.fullName,
            bloomLevel,
            age,
            emoji: presentation.emoji,
            interests: presentation.interests,
            learningStyle: presentation.learningStyle,
            workMethod: presentation.workMethod,
            concentration: presentation.concentration,
            strengths: presentation.strengths,
            smartTips: presentation.smartTips,
          }}
        />
      </div>
    </div>
  );
}
