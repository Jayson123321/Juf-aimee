import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  Sparkles,
  Star,
} from "lucide-react";
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(171,194,255,0.16),transparent_30%),linear-gradient(180deg,#fbfcff_0%,#f3f7ff_100%)] px-4 py-7 sm:px-6">
      <div className="mx-auto max-w-[760px] space-y-5">
        <div className="px-1">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-slate-900"
            href={`/prototype/leerling-portaal/${student.id}`}
          >
            <ArrowLeft className="size-4" />
            Terug naar portaal
          </Link>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_22px_60px_rgba(103,106,160,0.10)]">
          <div className="bg-gradient-to-r from-slate-500 to-slate-700 px-6 py-5 text-white">
            <div className="flex items-start gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/20 text-3xl">
                {student.emoji}
              </div>
              <div className="flex-1">
                <h1 className="text-[1.95rem] font-bold tracking-tight">
                  Hoi {student.name.split(" ")[0]}!
                </h1>
                <p className="mt-1 text-sm text-white/80">Hier zijn jouw opdrachten</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-white/12 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Star className="size-4 text-amber-300" />
                Jouw Niveau
              </div>
              <p className="mt-1 text-xs text-white/80">
                {student.status} - Bloom&apos;s Taxonomie
              </p>
            </div>
          </div>

          <div className="space-y-5 px-4 py-5 sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Jouw Opdrachten</h2>
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
              {activeAssignments.concat(completedAssignments).map((assignment) => (
                <article
                  key={assignment.id}
                  className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-[1.35rem] font-semibold leading-tight text-slate-950">
                        {assignment.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusPill(assignment.status)}`}>
                        {statusLabel(assignment.status)}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {assignment.bloomLevel}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-600">{assignment.description}</p>

                  <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4">
                    <p className="mb-2 text-sm font-semibold text-slate-900">Waarom deze opdracht?</p>
                    <p className="text-sm leading-7 text-slate-600">{assignment.rationale}</p>
                  </div>

                  <Link
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-500 to-slate-700 text-sm font-semibold text-white transition hover:from-slate-600 hover:to-slate-800"
                    href={`/prototype/leerling-portaal/${student.id}/opdrachten/${assignment.id}`}
                  >
                    <Sparkles className="size-4" />
                    {assignment.status === "completed" ? "Bekijk opdracht" : "Ga verder"}
                  </Link>

                  <p className="mt-3 text-xs text-slate-400">
                    Aangemaakt op {new Date(assignment.createdAt).toLocaleDateString("nl-NL")}
                  </p>
                </article>
              ))}

              {assignments.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                  Er zijn nog geen opdrachten voor jou klaargezet.
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-white/80 bg-white/92 px-5 py-5 shadow-[0_16px_40px_rgba(106,124,167,0.08)]">
          <h2 className="text-sm font-semibold text-slate-900">Jouw interesses</h2>
          <p className="mt-1 text-sm text-slate-500">Onderwerpen waar jij graag meer over leert</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {student.interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
              >
                <Circle className="size-2 fill-current stroke-none text-amber-400" />
                {interest}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#f6fbff_0%,#eef5ff_100%)] px-5 py-5 shadow-[0_16px_40px_rgba(106,124,167,0.08)]">
          <div className="flex items-center gap-3">
            <span className="text-xl">🚀</span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Jouw Groei en Ontwikkeling</h2>
              <p className="mt-1 text-xs text-slate-500">
                Je maakt geweldige vooruitgang! Je werkt nu op {student.status} niveau.
              </p>
            </div>
          </div>
          <div className="mt-4 h-2.5 rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-700"
              style={{ width: `${student.progress}%` }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
