import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Sparkles, Target } from "lucide-react";
import { prisma } from "@/lib/db";
import { getPrototypeStudent } from "@/lib/prototype-runtime";
import { AssignmentWorkspaceClient } from "./AssignmentWorkspaceClient";

function statusConfig(status: "PENDING" | "IN_PROGRESS" | "COMPLETED") {
  if (status === "COMPLETED") return { label: "Afgerond ✓", className: "bg-emerald-500/20 text-emerald-100 border-emerald-400/30" };
  if (status === "IN_PROGRESS") return { label: "Bezig…", className: "bg-amber-400/20 text-amber-100 border-amber-300/30" };
  return { label: "Nieuw", className: "bg-white/20 text-white/90 border-white/30" };
}

const bloomDescriptions: Record<string, string> = {
  Onthouden: "Benoem en herinner wat je hebt geleerd.",
  Begrijpen: "Leg het uit in je eigen woorden.",
  Toepassen: "Gebruik wat je weet in een nieuwe situatie.",
  Analyseren: "Ontdek verbanden en leg uit waarom iets zo werkt.",
  Evalueren: "Beoordeel en onderbouw jouw mening met argumenten.",
  "Creëren": "Maak iets nieuws op basis van wat je weet.",
};

export default async function PrototypeStudentAssignmentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string; assignmentId: string }>;
}) {
  const { studentId, assignmentId } = await params;

  const [student, assignment] = await Promise.all([
    getPrototypeStudent(studentId),
    prisma.assignment.findFirst({
      where: { id: assignmentId, studentId },
      select: {
        id: true,
        title: true,
        description: true,
        illustrationUrl: true,
        studentTip: true,
        bloomLevel: true,
        status: true,
        studentWork: true,
        submissions: {
          select: { id: true, fileName: true, filePath: true, mimeType: true, uploadedAt: true },
          orderBy: { uploadedAt: "desc" },
        },
      },
    }),
  ]);

  if (!student || !assignment) notFound();

  const status = statusConfig(assignment.status);
  const bloomLevel = assignment.bloomLevel ?? student.status;
  const bloomHint = bloomDescriptions[bloomLevel] ?? "";
  const firstName = student.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(171,194,255,0.22),transparent_40%),linear-gradient(180deg,#f5f7ff_0%,#edf2ff_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-[780px] space-y-6">

        {/* Back */}
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          href={`/prototype/leerling-portaal/${student.id}/opdrachten`}
        >
          <ArrowLeft className="size-4" />
          Terug naar mijn opdrachten
        </Link>

        {/* Hero header */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-blue-600 to-blue-500 shadow-[0_20px_50px_rgba(98,101,255,0.28)]">
          <div className="px-7 pt-7 pb-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <span className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${status.className}`}>
                {status.label}
              </span>
              <span className="text-4xl select-none">{student.emoji}</span>
            </div>

            <h1 className="text-[1.9rem] font-bold leading-snug tracking-tight text-white">
              {assignment.title.replace(/\*\*/g, "")}
            </h1>
            <p className="mt-2 text-base text-white/70">Voor {firstName}</p>
          </div>

          {/* Bloom level strip */}
          <div className="flex items-center gap-3 bg-white/10 px-7 py-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Target className="size-5 text-amber-300" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Denkniveau</p>
              <p className="text-sm font-semibold text-white">
                {bloomLevel}
                {bloomHint ? <span className="ml-2 font-normal text-white/75">— {bloomHint}</span> : null}
              </p>
            </div>
          </div>
        </div>

        {assignment.illustrationUrl && (
          <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[0_12px_36px_rgba(92,114,180,0.08)]">
            <div className="flex items-center gap-3 border-b border-blue-100 bg-blue-50/70 px-6 py-4">
              <div className="flex size-8 items-center justify-center rounded-xl bg-blue-100">
                <Sparkles className="size-4 text-blue-600" />
              </div>
              <h2 className="font-semibold text-slate-950">Illustratie bij de opdracht</h2>
            </div>
            <Image
              alt={`Illustratie bij ${assignment.title}`}
              className="h-auto w-full object-cover"
              src={assignment.illustrationUrl}
              height={900}
              unoptimized
              width={1400}
            />
          </div>
        )}

        {/* Assignment description */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_36px_rgba(92,114,180,0.08)]">
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
            <div className="flex size-8 items-center justify-center rounded-xl bg-violet-100">
              <BookOpen className="size-4 text-violet-600" />
            </div>
            <h2 className="font-semibold text-slate-950">De Opdracht</h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-[1.05rem] leading-8 text-slate-800 whitespace-pre-wrap">
              {(assignment.description ?? "Nog geen opdrachttekst beschikbaar.").replace(/\*\*/g, "")}
            </p>
          </div>

          {/* Juf Aimee tip */}
          {assignment.studentTip && (
            <div className="mx-6 mb-6 rounded-2xl bg-gradient-to-r from-violet-50 to-blue-50 px-5 py-4">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="size-4 text-violet-500" />
                <p className="text-sm font-semibold text-violet-800">Tip van Juf Aimee</p>
              </div>
              <p className="text-sm leading-7 text-slate-700">{assignment.studentTip.replace(/\*\*/g, "")}</p>
            </div>
          )}
        </div>

        {/* Workspace */}
        <AssignmentWorkspaceClient
          assignmentId={assignment.id}
          firstName={firstName}
          initialSubmissions={assignment.submissions}
          initialWork={assignment.studentWork ?? ""}
          isCompleted={assignment.status === "COMPLETED"}
          studentId={student.id}
        />

      </div>
    </div>
  );
}
