import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clipboard, Lightbulb, Target } from "lucide-react";
import { prisma } from "@/lib/db";
import { getPrototypeStudent } from "@/lib/prototype-runtime";
import { AssignmentWorkspaceClient } from "./AssignmentWorkspaceClient";

function statusLabel(status: "PENDING" | "IN_PROGRESS" | "COMPLETED") {
  if (status === "COMPLETED") return "Afgerond";
  if (status === "IN_PROGRESS") return "Bezig";
  return "Nieuw";
}

export default async function PrototypeStudentAssignmentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string; assignmentId: string }>;
}) {
  const { studentId, assignmentId } = await params;

  const [student, assignment] = await Promise.all([
    getPrototypeStudent(studentId),
    prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        studentId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        uitleg: true,
        bloomLevel: true,
        status: true,
        studentWork: true,
      },
    }),
  ]);

  if (!student || !assignment) notFound();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(171,194,255,0.16),transparent_30%),linear-gradient(180deg,#fbfcff_0%,#f3f7ff_100%)] px-4 py-7 sm:px-6">
      <div className="mx-auto max-w-[760px] space-y-5">
        <div className="px-1">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-slate-900"
            href={`/prototype/leerling-portaal/${student.id}/opdrachten`}
          >
            <ArrowLeft className="size-4" />
            Terug naar opdrachten
          </Link>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_22px_60px_rgba(103,106,160,0.10)]">
          <div className="bg-gradient-to-r from-slate-500 to-slate-700 px-6 py-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-[2rem] font-bold tracking-tight">{assignment.title}</h1>
                <p className="mt-2 text-sm text-white/80">Voor {student.name}</p>
              </div>
              <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-slate-700">
                {statusLabel(assignment.status)}
              </span>
            </div>

            <div className="mt-5 rounded-2xl bg-white/12 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Target className="size-4 text-amber-300" />
                Jouw niveau
              </div>
              <p className="mt-1 text-xs text-white/80">{assignment.bloomLevel ?? student.status}</p>
            </div>
          </div>

          <div className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
            <section className="rounded-[24px] border border-white/80 bg-white/95 p-5 shadow-[0_16px_40px_rgba(106,124,167,0.08)]">
              <div className="mb-4 flex items-center gap-2">
                <Clipboard className="size-4 text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-900">De Opdracht</h2>
              </div>

              <div className="space-y-4">
                <p className="text-sm leading-8 text-slate-700">
                  {assignment.description ?? "Nog geen opdrachttekst beschikbaar."}
                </p>

                <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky-700">
                    <Lightbulb className="size-4" />
                    Tip van Juf Aimee
                  </div>
                  <p className="text-sm leading-7 text-sky-700">
                    {assignment.uitleg ??
                      `${student.name.split(" ")[0]}: neem rustig de tijd, werk stap voor stap en gebruik voorbeelden om je antwoord duidelijk te maken.`}
                  </p>
                </div>
              </div>
            </section>

            <AssignmentWorkspaceClient
              assignmentId={assignment.id}
              initialWork={assignment.studentWork ?? ""}
              isCompleted={assignment.status === "COMPLETED"}
              studentId={student.id}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
