import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  getPrototypeAssignments,
  getPrototypeStudent,
  type PrototypeAssignment,
  type PrototypeSubjectScore,
} from "@/lib/prototype-runtime";

function PageCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-[28px] border border-[rgba(153,164,207,0.28)] bg-white/92 shadow-[0_18px_50px_rgba(92,114,180,0.08)] ${className}`}
    >
      {children}
    </section>
  );
}

function CardHeaderBlock({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-[1.2rem] font-semibold text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

const statStyles = {
  green:  { box: "bg-green-50  border border-green-200  shadow-[0_0_16px_rgba(34,197,94,0.15)]",  num: "text-green-600",  label: "text-green-700" },
  amber:  { box: "bg-amber-50  border border-amber-200  shadow-[0_0_16px_rgba(251,191,36,0.15)]",  num: "text-amber-600",  label: "text-amber-700" },
  violet: { box: "bg-violet-50 border border-violet-200 shadow-[0_0_16px_rgba(139,92,246,0.15)]", num: "text-violet-600", label: "text-violet-700" },
} as const;

function StatBox({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: keyof typeof statStyles;
}) {
  const s = statStyles[color];
  return (
    <div className={`rounded-2xl p-5 ${s.box}`}>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <span className={`text-sm font-semibold ${s.label}`}>{label}</span>
      </div>
      <p className={`text-3xl font-bold ${s.num}`}>{value}</p>
    </div>
  );
}

function SubjectScoreRow({ score }: { score: PrototypeSubjectScore }) {
  const trendSymbol = score.trend === "up" ? "->" : score.trend === "down" ? "<-" : "--";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_5px_12px_rgba(15,23,42,0.03)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950">{score.subject}</p>
          <p className="mt-1 text-sm text-slate-500">
            Bloom: {score.bloomLevel} | Laatste toets:{" "}
            {new Date(score.lastAssessment).toLocaleDateString("nl-NL")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-slate-950">{score.currentScore.toFixed(1)}/10</p>
          <p className="text-sm text-slate-500">{trendSymbol}</p>
        </div>
      </div>
    </div>
  );
}

function AssignmentItem({ assignment, studentId }: { assignment: PrototypeAssignment; studentId: string }) {
  const statusLabel =
    assignment.status === "completed"
      ? "Afgerond"
      : assignment.status === "in_progress"
        ? "Bezig"
        : "Niet gestart";

  const statusClassName =
    assignment.status === "completed"
      ? "bg-green-100 text-green-700"
      : assignment.status === "in_progress"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-700";

  return (
    <Link
      className="block rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_8px_22px_rgba(109,123,166,0.05)] transition hover:border-violet-200 hover:shadow-[0_8px_28px_rgba(98,101,255,0.10)]"
      href={`/student/${studentId}/opdrachten/${assignment.id}`}
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-950">{assignment.title}</h3>
          <p className="line-clamp-2 text-sm leading-6 text-slate-600">{assignment.description}</p>
        </div>
        <span className="inline-flex shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700">
          {assignment.bloomLevel}
        </span>
      </div>

      {assignment.feedback ? (
        <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3">
          <p className="mb-1 text-xs font-semibold text-emerald-800">Feedback</p>
          <p className="line-clamp-2 text-sm leading-6 text-slate-700">{assignment.feedback}</p>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-slate-500">
          {new Date(assignment.createdAt).toLocaleDateString("nl-NL")}
        </span>
        <span className={`rounded-full px-3 py-1 font-medium ${statusClassName}`}>{statusLabel}</span>
      </div>
    </Link>
  );
}

export default async function StudentProfielPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getPrototypeStudent(id);

  if (!student) notFound();

  const assignments = await getPrototypeAssignments(id);
  const completedAssignments = assignments.filter((a) => a.status === "completed");
  const inProgressAssignments = assignments.filter((a) => a.status === "in_progress");
  const notStartedAssignments = assignments.filter((a) => a.status === "not_started");

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,rgba(171,194,255,0.2),transparent_30%),linear-gradient(180deg,#f7f9ff_0%,#eef4ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">

        <PageCard className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-[72px] items-center justify-center rounded-full bg-slate-100 text-5xl shadow-inner ring-1 ring-slate-200">
                {student.emoji}
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950">{student.name}</h1>
                <p className="text-base text-slate-600">{student.age} jaar - Hoogbegaafd</p>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                  <span>{student.badgeEmoji}</span>
                  {student.status}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatBox icon={<CheckCircle2 className="size-5 text-green-500" />} label="Afgerond" value={completedAssignments.length} color="green" />
            <StatBox icon={<Clock className="size-5 text-amber-500" />} label="Bezig" value={inProgressAssignments.length} color="amber" />
            <StatBox icon={<BookOpen className="size-5 text-violet-500" />} label="Te Starten" value={notStartedAssignments.length} color="violet" />
          </div>
        </PageCard>

        <PageCard>
          <CardHeaderBlock title="Leerlingprofiel" description="Uitgebreide informatie voor gepersonaliseerde opdrachten" />
          <div className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Schooljaar</p>
                <p className="mt-1 text-base text-slate-900">{student.schoolYear}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Huidige leerkracht</p>
                <p className="mt-1 text-base text-slate-900">{student.currentTeacher}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Leerstijl</p>
                <p className="mt-1 text-base text-slate-900">{student.learningStyle}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Werkmethode</p>
                <p className="mt-1 text-base text-slate-900">{student.workMethod}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Profielsamenvatting</p>
                <p className="mt-1 text-base leading-7 text-slate-700">{student.profileSummary}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Sterktes</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {student.strengths.map((s) => (
                    <span key={s} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 ring-1 ring-slate-200">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Ondersteuningsbehoeften</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {student.supportNeeds.map((n) => (
                    <span key={n} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-blue-100">{n}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PageCard>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PageCard>
            <CardHeaderBlock title="Interesses" description={`Onderwerpen die ${student.name} motiveren`} />
            <div className="space-y-3 px-6 py-6">
              {student.interests.map((interest) => (
                <div key={interest} className="flex items-center gap-3 rounded-2xl bg-blue-50 px-4 py-3">
                  <span className="text-xl">💡</span>
                  <span className="font-medium text-slate-900">{interest}</span>
                </div>
              ))}
            </div>
          </PageCard>

          <PageCard>
            <CardHeaderBlock title="Voortgang" description="Ontwikkeling op Bloom's Taxonomie" />
            <div className="space-y-5 px-6 py-6">
              <div>
                <div className="mb-2 flex justify-between">
                  <span className="font-medium text-slate-900">Totale Voortgang</span>
                  <span className="text-sm font-semibold text-slate-700">{student.progress}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-slate-600" style={{ width: `${student.progress}%` }} />
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <p className="mb-3 text-sm text-slate-500">Huidige Niveau:</p>
                <div className="flex items-center gap-3">
                  <TrendingUp className="size-5 text-green-600" />
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                    <span>{student.badgeEmoji}</span>
                    {student.status}
                  </div>
                </div>
              </div>
            </div>
          </PageCard>
        </div>

        <PageCard>
          <CardHeaderBlock title="Vakresultaten & Bewijsmateriaal" description="Resultaten en observaties per vakgebied" />
          <div className="space-y-4 px-6 py-6">
            {student.subjectScores.map((score) => (
              <SubjectScoreRow key={score.subject} score={score} />
            ))}
          </div>
        </PageCard>

        <PageCard>
          <CardHeaderBlock title="Didactische Aanbevelingen" description="Didactische richtlijnen voor lesontwerp en begeleiding" />
          <div className="space-y-4 px-6 py-6">
            <div>
              <p className="text-sm font-semibold text-slate-500">Motivatiefactoren</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {student.motivationFactors.map((f) => (
                  <span key={f} className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700 ring-1 ring-violet-100">{f}</span>
                ))}
              </div>
            </div>
            <div className="rounded-3xl bg-blue-50 px-5 py-5">
              <p className="mb-3 text-sm font-semibold text-slate-900">Aanbevelingen voor de leerkracht</p>
              <ul className="space-y-2 text-sm leading-7 text-slate-700">
                {student.didacticTips.map((tip) => (
                  <li key={tip}>- {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </PageCard>

        <PageCard>
          <CardHeaderBlock
            title="AI-gegenereerde Opdrachten"
            description="Gepersonaliseerde opdrachten gebaseerd op interesses en niveau"
          />
          <div className="space-y-4 px-6 py-6">
            {assignments.length === 0 ? (
              <p className="py-8 text-center text-slate-500">Nog geen opdrachten gegenereerd voor deze leerling</p>
            ) : (
              assignments.map((assignment) => (
                <AssignmentItem assignment={assignment} key={assignment.id} studentId={id} />
              ))
            )}
          </div>
        </PageCard>

      </div>
    </div>
  );
}
