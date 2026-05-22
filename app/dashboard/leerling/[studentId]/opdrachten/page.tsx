import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  ClipboardList,
  MessageSquare,
  Plus,
  Sparkles,
  Star,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { BackLink } from "@/components/BackLink";
import { getBloomLevelLabel } from "@/lib/student-profile";

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

const STATUS = {
  COMPLETED: {
    label: "Afgerond",
    badge: "bg-emerald-100 text-emerald-700",
    chip: "bg-emerald-100 text-emerald-600",
    icon: CheckCircle2,
  },
  IN_PROGRESS: {
    label: "Bezig",
    badge: "bg-amber-100 text-amber-700",
    chip: "bg-amber-100 text-amber-600",
    icon: Clock,
  },
  PENDING: {
    label: "Nieuw",
    badge: "bg-violet-100 text-violet-700",
    chip: "bg-violet-100 text-violet-600",
    icon: Sparkles,
  },
} as const;

function getStatus(status: string) {
  return STATUS[status as keyof typeof STATUS] ?? STATUS.PENDING;
}

function StatTile({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className: string;
}) {
  return (
    <div className={`rounded-2xl px-4 py-3 text-center ${className}`}>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-medium opacity-80">{label}</p>
    </div>
  );
}

export default async function TeacherStudentAssignmentsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const student = await getStudentWithAssignments(studentId);
  if (!student) notFound();

  const assignments = student.assignments;
  const completed = assignments.filter((a) => a.status === "COMPLETED");
  const inProgress = assignments.filter((a) => a.status === "IN_PROGRESS");
  const pending = assignments.filter((a) => a.status === "PENDING");

  const progressPct =
    assignments.length > 0
      ? Math.round((completed.length / assignments.length) * 100)
      : 0;

  const initials = student.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const bloomLabel = getBloomLevelLabel(student.bloomNiveau);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(230,235,246,0.9),transparent_32%),linear-gradient(180deg,#fcfbff_0%,#f6f7fb_100%)] px-4 py-7 sm:px-6">
      <div className="mx-auto max-w-[1100px] space-y-4">
        <BackLink />

        <section className="overflow-hidden rounded-[24px] border border-slate-200/90 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          {/* Gradient header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-blue-600 to-blue-500 px-6 py-7 text-white">
            <div className="pointer-events-none absolute -left-8 -top-10 size-36 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-12 right-16 size-32 rounded-full bg-sky-300/25 blur-2xl" />

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15 text-xl font-extrabold shadow-inner">
                  {initials}
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {student.fullName}
                  </h1>
                  <p className="mt-1 text-sm text-white/75">
                    Groep {student.groep ?? "onbekend"} · {assignments.length}{" "}
                    opdracht{assignments.length !== 1 ? "en" : ""}
                  </p>
                </div>
              </div>
              <Link
                href={`/student/${student.id}/generate`}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-violet-600 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Plus className="size-4" />
                Nieuwe opdracht
              </Link>
            </div>

            <div className="relative mt-5 inline-flex items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <Star className="size-5 shrink-0 fill-amber-300 text-amber-300" />
              <div>
                <p className="text-sm font-semibold leading-tight">
                  Bloom-niveau leerling
                </p>
                <p className="text-xs text-white/75">
                  {bloomLabel} — Bloom&apos;s Taxonomie
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 px-5 py-5 sm:px-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <StatTile
                value={completed.length}
                label="Afgerond"
                className="bg-emerald-50 text-emerald-700"
              />
              <StatTile
                value={inProgress.length}
                label="Bezig"
                className="bg-amber-50 text-amber-700"
              />
              <StatTile
                value={pending.length}
                label="Nieuw"
                className="bg-violet-50 text-violet-700"
              />
            </div>

            {/* Progress */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-800">
                  📈 Voortgang
                </span>
                <span className="font-bold text-violet-600">
                  {completed.length} / {assignments.length} afgerond
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-500 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Section title */}
            <div>
              <h2 className="text-sm font-semibold text-slate-950">
                Alle opdrachten
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Voortgang, details en jouw feedback per opdracht.
              </p>
            </div>

            {/* Assignment list */}
            {assignments.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
                <ClipboardList className="mx-auto mb-3 size-10 text-violet-300" />
                <p className="font-bold text-slate-600">Nog geen opdrachten</p>
                <p className="mt-1 text-sm text-slate-400">
                  Maak een AI-opdracht aan via de knop hierboven.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment) => {
                  const status = getStatus(assignment.status);
                  const StatusIcon = status.icon;
                  const feedback = assignment.teacherFeedback?.content;

                  return (
                    <Link
                      key={assignment.id}
                      href={`/dashboard/leerling/${student.id}/opdrachten/${assignment.id}`}
                      className="group block rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <span
                            className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${status.chip}`}
                          >
                            <StatusIcon className="size-5" />
                          </span>
                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold leading-tight text-slate-950">
                              {assignment.title.replace(/\*\*/g, "")}
                            </h3>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              {assignment.bloomLevel && (
                                <span className="rounded-full bg-violet-50 px-2.5 py-0.5 font-semibold text-violet-700">
                                  Bloom: {assignment.bloomLevel}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="size-3" />
                                Aangemaakt{" "}
                                {new Date(
                                  assignment.createdAt,
                                ).toLocaleDateString("nl-NL")}
                              </span>
                              {assignment.submittedAt && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="size-3" />
                                  Ingeleverd{" "}
                                  {new Date(
                                    assignment.submittedAt,
                                  ).toLocaleDateString("nl-NL")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${status.badge}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {/* Teacher feedback */}
                      {feedback ? (
                        <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-2.5">
                          <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                            <MessageSquare className="size-3.5" />
                            Jouw feedback
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-emerald-800">
                            {feedback}
                          </p>
                        </div>
                      ) : (
                        assignment.status === "COMPLETED" && (
                          <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3.5 py-2.5 text-sm font-semibold text-amber-700">
                            Nog geen feedback — open de opdracht om feedback te
                            geven.
                          </div>
                        )
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
