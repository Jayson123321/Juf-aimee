import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  FileText,
  MessageSquare,
  Pencil,
  Sparkles,
} from "lucide-react";
import { getPrototypeAssignment, getPrototypeStudent } from "@/lib/prototype-runtime";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string; assignmentId: string }>;
}) {
  const { studentId, assignmentId } = await params;

  const [student, assignment] = await Promise.all([
    getPrototypeStudent(studentId),
    getPrototypeAssignment(assignmentId),
  ]);

  if (!student || !assignment) notFound();

  const statusLabel =
    assignment.status === "completed"
      ? "Afgerond"
      : assignment.status === "in_progress"
        ? "Bezig"
        : "Niet gestart";

  const statusClassName =
    assignment.status === "completed"
      ? "border-green-200 bg-green-50 text-green-700"
      : assignment.status === "in_progress"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(171,194,255,0.2),transparent_30%),linear-gradient(180deg,#f7f9ff_0%,#eef4ff_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">

        <Link
          className="inline-flex items-center gap-3 text-[1.05rem] font-medium text-slate-900 transition hover:text-slate-700"
          href={`/prototype/hoogbegaafde-leerlingen/${studentId}/profiel`}
        >
          <ArrowLeft className="size-5" />
          Terug naar profiel van {student.name}
        </Link>

        {/* Header banner */}
        <div className="rounded-3xl bg-gradient-to-r from-violet-600 to-blue-600 px-7 py-7 text-white shadow-[0_12px_30px_rgba(98,101,255,0.22)]">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest opacity-75">
            <Sparkles className="size-4" />
            AI-gegenereerde opdracht
          </div>
          <h1 className="text-[1.8rem] font-bold leading-snug">{assignment.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
              {assignment.bloomLevel}
            </span>
            <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${statusClassName}`}>
              {statusLabel}
            </span>
            <span className="flex items-center gap-1 text-sm opacity-75">
              <Calendar className="size-4" />
              {new Date(assignment.createdAt).toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Assignment body */}
        <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-7 shadow-[0_18px_50px_rgba(92,114,180,0.08)]">
          <div className="mb-3 flex items-center gap-2 text-slate-700">
            <BookOpen className="size-4 shrink-0" />
            <p className="text-sm font-semibold uppercase tracking-wide">Opdrachtbeschrijving</p>
          </div>
          <p className="text-[1.06rem] leading-8 text-slate-800 whitespace-pre-wrap">
            {assignment.description}
          </p>
        </section>

        {/* Rationale */}
        <section className="rounded-[28px] border border-violet-100 bg-violet-50 p-7 shadow-[0_18px_50px_rgba(92,114,180,0.06)]">
          <div className="mb-3 flex items-center gap-2 text-violet-700">
            <Brain className="size-4 shrink-0" />
            <p className="text-sm font-semibold uppercase tracking-wide">Onderbouwing</p>
          </div>
          <p className="text-[1.04rem] leading-8 text-slate-700">{assignment.rationale}</p>
        </section>

        {/* Werk van de leerling */}
        {assignment.studentWork ? (
          <section className="rounded-[28px] border border-blue-200 bg-white/90 p-7 shadow-[0_18px_50px_rgba(92,114,180,0.06)]">
            <div className="mb-3 flex items-center gap-2 text-blue-700">
              <Pencil className="size-4 shrink-0" />
              <p className="text-sm font-semibold uppercase tracking-wide">Werk van {student.name.split(" ")[0]}</p>
            </div>
            <p className="text-[1.04rem] leading-8 text-slate-800 whitespace-pre-wrap">
              {assignment.studentWork}
            </p>
          </section>
        ) : (
          <section className="rounded-[28px] border border-slate-200 bg-white/90 p-7 text-center shadow-[0_18px_50px_rgba(92,114,180,0.06)]">
            <p className="text-sm italic text-slate-400">
              {assignment.status === "not_started"
                ? `${student.name.split(" ")[0]} is nog niet begonnen met deze opdracht.`
                : `${student.name.split(" ")[0]} heeft nog geen tekst ingeleverd.`}
            </p>
          </section>
        )}

        {/* Ingediende bestanden */}
        {assignment.submissions && assignment.submissions.length > 0 && (
          <section className="rounded-[28px] border border-blue-100 bg-white/90 p-7 shadow-[0_18px_50px_rgba(92,114,180,0.06)]">
            <div className="mb-4 flex items-center gap-2 text-blue-700">
              <FileText className="size-4 shrink-0" />
              <p className="text-sm font-semibold uppercase tracking-wide">
                Ingediende bestanden ({assignment.submissions.length})
              </p>
            </div>
            <ul className="space-y-3">
              {assignment.submissions.map((sub) => (
                <li key={sub.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <FileText className="size-5 shrink-0 text-blue-500" />
                  <div className="min-w-0 flex-1">
                    <a
                      className="truncate text-sm font-medium text-blue-700 hover:underline"
                      href={sub.filePath}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {sub.fileName}
                    </a>
                    <p className="text-xs text-slate-400">
                      {new Date(sub.uploadedAt).toLocaleDateString("nl-NL", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Teacher feedback */}
        <section className="rounded-[28px] border border-emerald-200 bg-white/90 p-7 shadow-[0_18px_50px_rgba(92,114,180,0.06)]">
          <div className="mb-3 flex items-center gap-2 text-emerald-700">
            <MessageSquare className="size-4 shrink-0" />
            <p className="text-sm font-semibold uppercase tracking-wide">Feedback van de leraar</p>
          </div>
          {assignment.feedback ? (
            <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 px-5 py-4">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
              <p className="text-[1.04rem] leading-8 text-slate-700">{assignment.feedback}</p>
            </div>
          ) : (
            <p className="text-sm italic text-slate-400">
              Nog geen feedback toegevoegd. Ga terug naar het profiel en keur de opdracht goed om feedback toe te voegen.
            </p>
          )}
        </section>

        {/* Footer actions */}
        <div className="flex gap-3">
          <Link
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            href={`/prototype/hoogbegaafde-leerlingen/${studentId}/profiel`}
          >
            Terug naar profiel
          </Link>
          <Link
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 px-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(98,101,255,0.2)] transition hover:from-violet-600 hover:to-blue-600"
            href={`/prototype/hoogbegaafde-leerlingen/${studentId}/ai-opdracht`}
          >
            <Sparkles className="size-4" />
            Nieuwe opdracht genereren
          </Link>
        </div>

      </div>
    </div>
  );
}
