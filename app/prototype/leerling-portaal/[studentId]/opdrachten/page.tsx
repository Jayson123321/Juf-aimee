import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, CheckCircle2, Star } from "lucide-react";
import { getPrototypeAssignments, getPrototypeStudent } from "@/lib/prototype-runtime";

function statusLabel(status: "completed" | "in_progress" | "not_started") {
  if (status === "completed") return "Afgerond";
  if (status === "in_progress") return "Bezig";
  return "Nieuw";
}

function statusPill(status: "completed" | "in_progress" | "not_started") {
  if (status === "completed") return "bg-slate-100 text-slate-700";
  if (status === "in_progress") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

export default async function PrototypeStudentAssignmentsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const student = await getPrototypeStudent(studentId);

  if (!student) notFound();

  const assignments = await getPrototypeAssignments(studentId);
  const activeAssignments = assignments.filter(
    (assignment) => assignment.status === "in_progress" || assignment.status === "not_started",
  );
  const completedAssignments = assignments.filter((assignment) => assignment.status === "completed");
  const orderedAssignments = [...activeAssignments, ...completedAssignments];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(230,235,246,0.9),transparent_32%),linear-gradient(180deg,#fcfbff_0%,#f6f7fb_100%)] px-4 py-7 sm:px-6">
      <div className="mx-auto max-w-[640px] space-y-4">
        <div className="px-1">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-slate-900"
            href={`/prototype/leerling-portaal/${student.id}`}
          >
            <ArrowLeft className="size-4" />
            Terug naar portaal
          </Link>
        </div>

        <section className="overflow-hidden rounded-[24px] border border-slate-200/90 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <div className="bg-[#262626] px-5 py-5 text-white">
            <div className="flex items-start gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/12 text-3xl">
                {student.emoji}
              </div>
              <div className="flex-1">
                <h1 className="text-[1.15rem] font-bold tracking-tight sm:text-[1.55rem]">
                  Hoi {student.name}!
                </h1>
                <p className="mt-1 text-sm text-white/65">Hier zijn jouw opdrachten</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white/8 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Star className="size-4 fill-amber-300 text-amber-300" />
                Jouw Niveau
              </div>
              <p className="mt-1 text-xs text-white/65">
                {student.status} - Bloom&apos;s Taxonomie
              </p>
            </div>
          </div>

          <div className="space-y-5 px-4 py-5 sm:px-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-950">Jouw Opdrachten</h2>
              <p className="mt-1 text-sm text-slate-500">
                Uitdagende opdrachten speciaal voor jou gemaakt
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-full bg-slate-100 p-1 text-xs font-semibold text-slate-600">
              <div className="flex items-center justify-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <BookOpen className="size-3.5" />
                Actieve Opdrachten ({activeAssignments.length})
              </div>
              <div className="flex items-center justify-center gap-2 rounded-full px-3 py-2">
                <CheckCircle2 className="size-3.5" />
                Afgerond ({completedAssignments.length})
              </div>
            </div>

            <div className="space-y-4">
              {orderedAssignments.map((assignment) => (
                <article
                  key={assignment.id}
                  className="rounded-[18px] border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold leading-tight text-slate-950">
                          {assignment.title}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusPill(assignment.status)}`}
                        >
                          {statusLabel(assignment.status)}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {assignment.bloomLevel}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-600">{assignment.description}</p>

                  <Link
                    className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-[#474747] text-sm font-medium text-white transition hover:bg-[#3e3e3e]"
                    href={`/prototype/leerling-portaal/${student.id}/opdrachten/${assignment.id}`}
                  >
                    {assignment.status === "completed"
                      ? "Bekijk opdracht"
                      : assignment.status === "in_progress"
                        ? "Ga verder"
                        : "Start Opdracht"}
                  </Link>

                  <p className="mt-3 text-xs text-slate-400">
                    Aangemaakt op {new Date(assignment.createdAt).toLocaleDateString("nl-NL")}
                  </p>
                </article>
              ))}

              {assignments.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                  Er zijn nog geen opdrachten voor jou klaargezet.
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-emerald-100 bg-[linear-gradient(180deg,#f6fffd_0%,#f2fbf8_100%)] px-5 py-4 shadow-[0_14px_32px_rgba(15,23,42,0.04)]">
          <div className="flex items-start gap-3">
            <span className="text-xl">🚀</span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-slate-950">Jouw Groei en Ontwikkeling</h2>
              <div className="mt-3 h-2.5 rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[#111827]"
                  style={{ width: `${student.progress}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-slate-600">
                Je maakt geweldige vooruitgang! Je werkt nu op {student.status} niveau. Blijf zo
                doorgaan!
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
