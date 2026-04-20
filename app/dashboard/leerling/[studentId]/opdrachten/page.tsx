import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, ClipboardList, MessageSquare, Plus } from "lucide-react";
import { prisma } from "@/lib/db";

async function getStudentWithAssignments(studentId: string) {
  return prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      fullName: true,
      groep: true,
      bloomNiveau: true,
      assignments: {
        select: {
          id: true,
          title: true,
          status: true,
          bloomLevel: true,
          createdAt: true,
          submittedAt: true,
          teacherFeedback: { select: { content: true } },
        },
        orderBy: { createdAt: "desc" },
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

export default async function TeacherStudentAssignmentsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const student = await getStudentWithAssignments(studentId);
  if (!student) notFound();

  const completed = student.assignments.filter((a) => a.status === "COMPLETED");
  const inProgress = student.assignments.filter((a) => a.status === "IN_PROGRESS");
  const pending = student.assignments.filter((a) => a.status === "PENDING");

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">

        {/* Back */}
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          href="/dashboard"
        >
          <ArrowLeft className="size-4" />
          Terug naar dashboard
        </Link>

        {/* Header */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{student.fullName}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Groep {student.groep ?? "onbekend"} · {student.assignments.length} opdrachten totaal
              </p>
            </div>
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
              href={`/prototype/hoogbegaafde-leerlingen/${student.id}/ai-opdracht`}
            >
              <Plus className="size-4" />
              Nieuwe opdracht
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-emerald-50 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-emerald-700">{completed.length}</p>
              <p className="text-xs text-emerald-600">Afgerond</p>
            </div>
            <div className="rounded-lg bg-amber-50 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-amber-700">{inProgress.length}</p>
              <p className="text-xs text-amber-600">Bezig</p>
            </div>
            <div className="rounded-lg bg-gray-100 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-gray-700">{pending.length}</p>
              <p className="text-xs text-gray-600">Nieuw</p>
            </div>
          </div>
        </div>

        {/* Assignment list */}
        {student.assignments.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
            <ClipboardList className="mx-auto mb-3 size-10 text-gray-300" />
            <p className="font-medium text-gray-500">Nog geen opdrachten</p>
            <p className="mt-1 text-sm text-gray-400">
              Maak een AI-opdracht aan via de knop hierboven.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {student.assignments.map((assignment) => {
              const badge = statusBadge(assignment.status);
              const hasFeedback = !!assignment.teacherFeedback?.content;

              return (
                <Link
                  key={assignment.id}
                  href={`/dashboard/leerling/${student.id}/opdrachten/${assignment.id}`}
                  className="block rounded-xl border border-gray-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {assignment.title.replace(/\*\*/g, "")}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                        {assignment.bloomLevel && (
                          <span>Bloom: {assignment.bloomLevel}</span>
                        )}
                        {assignment.submittedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            Ingeleverd {new Date(assignment.submittedAt).toLocaleDateString("nl-NL")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {assignment.status === "COMPLETED" && hasFeedback && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                          <MessageSquare className="size-3" />
                          Feedback gegeven
                        </span>
                      )}
                      {assignment.status === "COMPLETED" && !hasFeedback && (
                        <span className="text-xs font-medium text-amber-600">
                          Feedback toevoegen
                        </span>
                      )}
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {hasFeedback && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                      <span className="line-clamp-1">{assignment.teacherFeedback!.content}</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
