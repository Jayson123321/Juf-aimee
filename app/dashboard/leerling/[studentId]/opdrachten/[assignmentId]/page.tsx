import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Clock, Target } from "lucide-react";
import { prisma } from "@/lib/db";
import { TeacherFeedbackForm } from "./TeacherFeedbackForm";

async function getAssignment(assignmentId: string, studentId: string) {
  return prisma.assignment.findFirst({
    where: { id: assignmentId, studentId },
    select: {
      id: true,
      title: true,
      description: true,
      bloomLevel: true,
      status: true,
      studentWork: true,
      submittedAt: true,
      createdAt: true,
      teacherFeedback: { select: { content: true } },
      student: {
        select: { id: true, fullName: true, groep: true },
      },
    },
  });
}

function statusBadge(status: string) {
  if (status === "COMPLETED")
    return { label: "Afgerond", className: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  if (status === "IN_PROGRESS")
    return { label: "Bezig", className: "bg-amber-100 text-amber-700 border-amber-200" };
  return { label: "Nieuw", className: "bg-gray-100 text-gray-600 border-gray-200" };
}

export default async function TeacherAssignmentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string; assignmentId: string }>;
}) {
  const { studentId, assignmentId } = await params;
  const assignment = await getAssignment(assignmentId, studentId);
  if (!assignment) notFound();

  const badge = statusBadge(assignment.status);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-5">

        {/* Back */}
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          href={`/dashboard/leerling/${studentId}/opdrachten`}
        >
          <ArrowLeft className="size-4" />
          Terug naar opdrachten van {assignment.student.fullName}
        </Link>

        {/* Header */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold text-gray-900">
              {assignment.title.replace(/\*\*/g, "")}
            </h1>
            <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${badge.className}`}>
              {badge.label}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Target className="size-4" />
              Bloom: {assignment.bloomLevel ?? "onbekend"}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              Aangemaakt: {new Date(assignment.createdAt).toLocaleDateString("nl-NL")}
            </span>
            {assignment.submittedAt && (
              <span className="flex items-center gap-1.5 text-emerald-600">
                <Clock className="size-4" />
                Ingeleverd: {new Date(assignment.submittedAt).toLocaleDateString("nl-NL")}
              </span>
            )}
          </div>
        </div>

        {/* Opdrachttekst */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="size-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">De Opdracht</h2>
          </div>
          <p className="text-sm leading-7 text-gray-700 whitespace-pre-wrap">
            {(assignment.description ?? "Geen opdrachttekst beschikbaar.").replace(/\*\*/g, "")}
          </p>
        </div>

        {/* Werk van leerling */}
        {assignment.studentWork ? (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="mb-3 font-semibold text-blue-900">
              Ingeleverd werk van {assignment.student.fullName}
            </h2>
            <p className="text-sm leading-7 text-blue-800 whitespace-pre-wrap">
              {assignment.studentWork}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-8 text-center">
            <p className="text-sm text-gray-400">
              {assignment.status === "PENDING"
                ? "De leerling is nog niet begonnen."
                : "De leerling heeft nog geen werk ingeleverd."}
            </p>
          </div>
        )}

        {/* Feedback sectie — alleen bij COMPLETED */}
        {assignment.status === "COMPLETED" && (
          <TeacherFeedbackForm
            assignmentId={assignment.id}
            existingFeedback={assignment.teacherFeedback?.content ?? null}
            studentName={assignment.student.fullName}
          />
        )}
      </div>
    </div>
  );
}
