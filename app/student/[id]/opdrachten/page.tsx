import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { getPrototypeAssignments, getPrototypeStudent } from "@/lib/prototype-runtime";
import { TabBar } from "./TabBar";

function statusLabel(status: "completed" | "in_progress" | "not_started") {
  if (status === "completed") return "Afgerond";
  if (status === "in_progress") return "Bezig";
  return "Nieuw";
}

function statusPill(status: "completed" | "in_progress" | "not_started") {
  if (status === "completed") return "bg-emerald-100 text-emerald-700";
  if (status === "in_progress") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

export default async function StudentAssignmentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;

  const student = await getPrototypeStudent(id);
  if (!student) notFound();

  const assignments = await getPrototypeAssignments(id);
  const activeAssignments = assignments.filter(
    (a) => a.status === "in_progress" || a.status === "not_started",
  );
  const completedAssignments = assignments.filter((a) => a.status === "completed");

  const showCompleted = tab === "afgerond";
  const visibleAssignments = showCompleted ? completedAssignments : activeAssignments;

  const progressPct = assignments.length > 0
    ? Math.round((completedAssignments.length / assignments.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(230,235,246,0.9),transparent_32%),linear-gradient(180deg,#fcfbff_0%,#f6f7fb_100%)] px-4 py-7 sm:px-6">
      <div className="mx-auto max-w-[1100px] space-y-4">
        <section className="overflow-hidden rounded-[24px] border border-slate-200/90 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">

          {/* Header */}
          <div className="bg-gradient-to-br from-violet-600 via-blue-600 to-blue-500 px-6 py-7 text-white">
            <div className="flex items-start gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15 text-4xl shadow-inner">
                {student.emoji}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Hoi {student.name}!
                </h1>
                <p className="mt-1 text-sm text-white/70">Hier zijn jouw opdrachten</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Star className="size-4 fill-amber-300 text-amber-300" />
                Jouw Niveau
              </div>
              <p className="mt-1 text-xs text-white/70">
                {student.status} - Bloom&apos;s Taxonomie
              </p>
            </div>
          </div>

          <div className="space-y-5 px-5 py-5">

            {/* Progress bar */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-800">🚀 Jouw Voortgang</span>
                <span className="font-bold text-violet-600">
                  {completedAssignments.length} / {assignments.length} afgerond
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-500 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {assignments.length - completedAssignments.length} opdracht{assignments.length - completedAssignments.length !== 1 ? "en" : ""} nog te doen
              </p>
            </div>

            {/* Section title */}
            <div>
              <h2 className="text-sm font-semibold text-slate-950">Jouw Opdrachten</h2>
              <p className="mt-1 text-sm text-slate-500">
                Uitdagende opdrachten speciaal voor jou gemaakt
              </p>
            </div>

            {/* Tabs */}
            <TabBar activeCount={activeAssignments.length} completedCount={completedAssignments.length} />

            {/* Assignment list */}
            <div className="space-y-4">
              {visibleAssignments.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                  {showCompleted ? "Je hebt nog geen opdrachten afgerond." : "Er zijn geen actieve opdrachten."}
                </div>
              ) : (
                visibleAssignments.map((assignment) => (
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
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusPill(assignment.status)}`}>
                            {statusLabel(assignment.status)}
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {assignment.bloomLevel}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-slate-600">{assignment.description}</p>

                    <Link
                      className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-blue-500 text-sm font-medium text-white transition hover:from-violet-700 hover:to-blue-600"
                      href={`/student/${student.id}/opdrachten/${assignment.id}`}
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
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
