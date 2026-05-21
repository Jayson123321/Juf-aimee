import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Heart,
  Lightbulb,
  NotebookPen,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  getPrototypeAssignments,
  getPrototypeStudent,
  type PrototypeAssignment,
  type PrototypeSubjectScore,
} from "@/lib/prototype-runtime";

/** Per-section colour tones — coloured header band + soft tinted body. */
const TONES = {
  violet: {
    card: "border-violet-200/80 bg-violet-50/70",
    header: "bg-gradient-to-r from-violet-600 to-purple-500",
  },
  amber: {
    card: "border-amber-200/80 bg-amber-50/70",
    header: "bg-gradient-to-r from-amber-500 to-orange-400",
  },
  emerald: {
    card: "border-emerald-200/80 bg-emerald-50/70",
    header: "bg-gradient-to-r from-emerald-600 to-teal-500",
  },
  sky: {
    card: "border-sky-200/80 bg-sky-50/70",
    header: "bg-gradient-to-r from-sky-600 to-blue-500",
  },
  rose: {
    card: "border-rose-200/80 bg-rose-50/70",
    header: "bg-gradient-to-r from-rose-500 to-pink-500",
  },
} as const;

type Tone = keyof typeof TONES;

function PageCard({
  tone,
  children,
}: {
  tone: Tone;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`overflow-hidden rounded-[28px] border shadow-[0_18px_50px_rgba(92,114,180,0.12)] ${TONES[tone].card}`}
    >
      {children}
    </section>
  );
}

function CardHeaderBlock({
  tone,
  icon,
  title,
  description,
}: {
  tone: Tone;
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-6 py-4 text-white ${TONES[tone].header}`}
    >
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
        {icon}
      </span>
      <div>
        <h2 className="text-base font-bold">{title}</h2>
        {description ? (
          <p className="text-sm text-white/85">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

const statStyles = {
  green: {
    box: "bg-gradient-to-br from-emerald-100 to-green-50 border border-emerald-200",
    num: "text-emerald-700",
    label: "text-emerald-700",
  },
  amber: {
    box: "bg-gradient-to-br from-amber-100 to-orange-50 border border-amber-200",
    num: "text-amber-700",
    label: "text-amber-700",
  },
  violet: {
    box: "bg-gradient-to-br from-violet-100 to-purple-50 border border-violet-200",
    num: "text-violet-700",
    label: "text-violet-700",
  },
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
    <div
      className={`rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-md ${s.box}`}
    >
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <span className={`text-sm font-semibold ${s.label}`}>{label}</span>
      </div>
      <p className={`text-3xl font-extrabold ${s.num}`}>{value}</p>
    </div>
  );
}

function Pills({
  items,
  className,
}: {
  items: string[];
  className: string;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`rounded-full px-3 py-1 text-sm font-semibold ${className}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function SubjectScoreRow({ score }: { score: PrototypeSubjectScore }) {
  const trend =
    score.trend === "up"
      ? { icon: <TrendingUp className="size-4 text-emerald-600" /> }
      : score.trend === "down"
        ? { icon: <TrendingUp className="size-4 rotate-180 text-rose-500" /> }
        : { icon: <span className="text-slate-400">—</span> };

  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-sm">
      <div>
        <p className="font-semibold text-slate-950">{score.subject}</p>
        <p className="mt-1 text-sm text-slate-500">
          Bloom: {score.bloomLevel} · Laatste toets:{" "}
          {new Date(score.lastAssessment).toLocaleDateString("nl-NL")}
        </p>
      </div>
      <div className="flex items-center gap-2 text-right">
        <span className="text-lg font-bold text-slate-950">
          {score.currentScore.toFixed(1)}
          <span className="text-sm font-medium text-slate-400">/10</span>
        </span>
        {trend.icon}
      </div>
    </div>
  );
}

function AssignmentItem({
  assignment,
  studentId,
}: {
  assignment: PrototypeAssignment;
  studentId: string;
}) {
  const statusLabel =
    assignment.status === "completed"
      ? "Afgerond"
      : assignment.status === "in_progress"
        ? "Bezig"
        : "Niet gestart";

  const statusClassName =
    assignment.status === "completed"
      ? "bg-emerald-100 text-emerald-700"
      : assignment.status === "in_progress"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-600";

  return (
    <Link
      className="group block rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_8px_22px_rgba(109,123,166,0.05)] transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-[0_10px_28px_rgba(98,101,255,0.14)]"
      href={`/student/${studentId}/opdrachten/${assignment.id}`}
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-950">
          {assignment.title}
        </h3>
        <span className="inline-flex shrink-0 rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
          {assignment.bloomLevel}
        </span>
      </div>

      {/* The student's own reflection on this assignment */}
      {assignment.reflection?.content ? (
        <div className="mb-4 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 px-4 py-3">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-violet-700">
            <NotebookPen className="size-3.5" />
            Mijn reflectie
          </p>
          <p className="line-clamp-3 text-sm leading-6 text-slate-700">
            {assignment.reflection.content}
          </p>
        </div>
      ) : (
        <div className="mb-4 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-400">
          Nog geen reflectie geschreven voor deze opdracht.
        </div>
      )}

      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-slate-500">
          {new Date(assignment.createdAt).toLocaleDateString("nl-NL")}
        </span>
        <span className={`rounded-full px-3 py-1 font-medium ${statusClassName}`}>
          {statusLabel}
        </span>
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

  const reflectionCount = assignments.filter(
    (a) => !!a.reflection?.content,
  ).length;

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.28),transparent_34%),linear-gradient(180deg,#f3f1ff_0%,#e7e3fb_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-600 via-blue-600 to-blue-500 p-7 text-white shadow-xl shadow-violet-300/60">
          <div className="pointer-events-none absolute -left-8 -top-10 size-40 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 right-16 size-36 rounded-full bg-sky-300/30 blur-2xl" />
          <div className="pointer-events-none absolute top-6 right-1/3 size-24 rounded-full bg-fuchsia-400/25 blur-2xl" />

          <div className="relative flex items-center gap-5">
            <div className="flex size-20 items-center justify-center rounded-3xl bg-white/15 text-5xl shadow-inner ring-1 ring-white/20">
              {student.emoji}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {student.name}
              </h1>
              <p className="mt-0.5 text-white/85">
                {student.age} jaar · Hoogbegaafd
              </p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-sm font-semibold backdrop-blur-sm">
                <span>{student.badgeEmoji}</span>
                {student.status}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatBox
            icon={<CheckCircle2 className="size-5 text-emerald-600" />}
            label="Afgerond"
            value={completedAssignments.length}
            color="green"
          />
          <StatBox
            icon={<Clock className="size-5 text-amber-600" />}
            label="Bezig"
            value={inProgressAssignments.length}
            color="amber"
          />
          <StatBox
            icon={<BookOpen className="size-5 text-violet-600" />}
            label="Te starten"
            value={notStartedAssignments.length}
            color="violet"
          />
          <StatBox
            icon={<NotebookPen className="size-5 text-violet-600" />}
            label="Reflecties"
            value={reflectionCount}
            color="violet"
          />
        </div>

        {/* Profiel */}
        <PageCard tone="violet">
          <CardHeaderBlock
            tone="violet"
            icon={<GraduationCap className="size-5" />}
            title="Leerlingprofiel"
            description="Uitgebreide informatie voor gepersonaliseerde opdrachten"
          />
          <div className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-2">
            <div className="space-y-4">
              <Field label="Schooljaar" value={student.schoolYear} />
              <Field label="Huidige leerkracht" value={student.currentTeacher} />
              <Field label="Leerstijl" value={student.learningStyle} />
              <Field label="Werkmethode" value={student.workMethod} />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-violet-700">
                  Profielsamenvatting
                </p>
                <p className="mt-1 text-base leading-7 text-slate-700">
                  {student.profileSummary}
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-violet-700">Sterktes</p>
                <Pills
                  items={student.strengths}
                  className="bg-emerald-100 text-emerald-700"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-violet-700">
                  Ondersteuningsbehoeften
                </p>
                <Pills
                  items={student.supportNeeds}
                  className="bg-sky-100 text-sky-700"
                />
              </div>
            </div>
          </div>
        </PageCard>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Interesses */}
          <PageCard tone="amber">
            <CardHeaderBlock
              tone="amber"
              icon={<Lightbulb className="size-5" />}
              title="Interesses"
              description={`Onderwerpen die ${student.name} motiveren`}
            />
            <div className="space-y-3 px-6 py-6">
              {student.interests.map((interest) => (
                <div
                  key={interest}
                  className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-white px-4 py-3 shadow-sm"
                >
                  <span className="text-xl">💡</span>
                  <span className="font-medium text-slate-900">{interest}</span>
                </div>
              ))}
            </div>
          </PageCard>

          {/* Voortgang */}
          <PageCard tone="emerald">
            <CardHeaderBlock
              tone="emerald"
              icon={<TrendingUp className="size-5" />}
              title="Voortgang"
              description="Ontwikkeling op Bloom's Taxonomie"
            />
            <div className="space-y-5 px-6 py-6">
              <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                <div className="mb-2 flex justify-between">
                  <span className="font-semibold text-slate-900">
                    Totale voortgang
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    {student.progress}%
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all"
                    style={{ width: `${student.progress}%` }}
                  />
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-bold text-emerald-700">
                  Huidig niveau
                </p>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  <span>{student.badgeEmoji}</span>
                  {student.status}
                </div>
              </div>
            </div>
          </PageCard>
        </div>

        {/* Vakresultaten */}
        <PageCard tone="sky">
          <CardHeaderBlock
            tone="sky"
            icon={<Award className="size-5" />}
            title="Vakresultaten & Bewijsmateriaal"
            description="Resultaten en observaties per vakgebied"
          />
          <div className="space-y-4 px-6 py-6">
            {student.subjectScores.map((score) => (
              <SubjectScoreRow key={score.subject} score={score} />
            ))}
          </div>
        </PageCard>

        {/* Didactische aanbevelingen */}
        <PageCard tone="rose">
          <CardHeaderBlock
            tone="rose"
            icon={<Target className="size-5" />}
            title="Didactische Aanbevelingen"
            description="Richtlijnen voor lesontwerp en begeleiding"
          />
          <div className="space-y-4 px-6 py-6">
            <div>
              <p className="text-sm font-bold text-rose-700">
                Motivatiefactoren
              </p>
              <Pills
                items={student.motivationFactors}
                className="bg-violet-100 text-violet-700"
              />
            </div>
            <div className="rounded-3xl border border-rose-100 bg-white px-5 py-5 shadow-sm">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-rose-700">
                <Heart className="size-4" />
                Aanbevelingen voor de leerkracht
              </p>
              <ul className="space-y-2 text-sm leading-7 text-slate-700">
                {student.didacticTips.map((tip) => (
                  <li key={tip} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-rose-400" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </PageCard>

        {/* Opdrachten + reflecties */}
        <PageCard tone="violet">
          <CardHeaderBlock
            tone="violet"
            icon={<Sparkles className="size-5" />}
            title="Mijn opdrachten & reflecties"
            description="Jouw opdrachten met je eigen reflecties erop"
          />
          <div className="space-y-4 px-6 py-6">
            {assignments.length === 0 ? (
              <p className="py-8 text-center text-slate-500">
                Nog geen opdrachten voor deze leerling.
              </p>
            ) : (
              assignments.map((assignment) => (
                <AssignmentItem
                  assignment={assignment}
                  key={assignment.id}
                  studentId={id}
                />
              ))
            )}
          </div>
        </PageCard>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-violet-100 bg-white px-4 py-3">
      <p className="text-sm font-bold text-violet-700">{label}</p>
      <p className="mt-0.5 text-base text-slate-900">{value}</p>
    </div>
  );
}
