import { cookies } from "next/headers";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { prisma } from "@/lib/db";
import heroImage from "@/app/Images/online-assistance.png";
import resourcesImage from "@/app/Images/resources.png";
import mathImage from "@/app/Images/math-assignment-numbers.png";
import exploreImage from "@/app/Images/resources-2.png";
import emptyImage from "@/app/Images/delivering-assignment-through-drawing.png";
import celebrateImage from "@/app/Images/congratulation.png";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  ChartSpline,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  Sparkles,
  Users,
} from "lucide-react";
import {
  deriveStudentPresentation,
  calculateStudentProgress,
  getBloomAppearance,
  getBloomLevelLabel,
  getStudentAge,
} from "@/lib/student-profile";
import { computeSignals, generateSignalAdvice } from "@/lib/signals";

export const dynamic = "force-dynamic";

const placeholderDashboardStats = {
  averageProgress: 83,
  bloomCounts: [
    { label: "Toepassen", count: 1 },
    { label: "Analyseren", count: 1 },
    { label: "Evalueren", count: 1 },
    { label: "Creëren", count: 1 },
  ],
  topInterests: [
    { label: "techniek", count: 2 },
    { label: "onderzoeken", count: 1 },
    { label: "presenteren", count: 1 },
    { label: "tekstanalyse", count: 1 },
    { label: "programmeren", count: 1 },
  ],
  longRunningAssignments: 2,
  activeAssignments: 2,
  completedAssignments: 1,
  aiAssignments: 6,
} as const;

async function getDashboardStudents() {
  const students = await prisma.student.findMany({
    include: {
      profile: {
        select: {
          schoolHistory: true,
        },
      },
      oppChunks: {
        select: {
          tekst: true,
        },
        take: 12,
      },
      assignments: {
        select: {
          id: true,
          title: true,
          description: true,
          uitleg: true,
          bloomLevel: true,
          status: true,
          createdAt: true,
          submittedAt: true,
          bloomNiveau: true,
        },
      },
    },
    orderBy: {
      fullName: "asc",
    },
  });

  return Promise.all(students.map(async (student) => {
    const presentation = deriveStudentPresentation({
      fullName: student.fullName,
      schoolHistory: student.profile?.schoolHistory,
      assignments: student.assignments,
      oppTexts: student.oppChunks.map((chunk) => chunk.tekst),
    });
    const bloomLabel = getBloomLevelLabel(student.bloomNiveau);
    const completedAssignments = student.assignments.filter(
      (assignment) => assignment.status === "COMPLETED",
    ).length;
    const signals = computeSignals(student.assignments, student, student.teacherNotes ?? undefined);

    const signalsWithAdvice = await generateSignalAdvice(student, signals);

    return {
      id: student.id,
      name: student.fullName,
      age: getStudentAge(student.dateOfBirth),
      emoji: presentation.emoji,
      interests: presentation.interests,
      progress: calculateStudentProgress(student.assignments),
      status: bloomLabel,
      completedAssignments,
      totalAssignments: student.assignments.length,
      badge: getBloomAppearance(bloomLabel),
      teacherNotes: student.teacherNotes ?? "",
      signals: signalsWithAdvice,
    };
  }));
}


async function saveTeacherNotes(studentId: string, notes: string) {
  "use server";
  await prisma.student.update({
    where: { id: studentId },
    data: { teacherNotes: notes },
  });
}


async function getTeacherName() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;
  if (!userId) return "Juf";
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });
  const raw = user?.name ?? user?.email ?? "Juf";
  const first = raw.split(/[.\s@_-]/)[0] || "Juf";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Goedemorgen";
  if (hour < 18) return "Goedemiddag";
  return "Goedenavond";
}

/** Subtle marker for cards still showing example numbers. */
function SampleTag({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400 ${className}`}
    >
      <span className="size-1.5 rounded-full bg-gray-300" />
      Voorbeelddata
    </span>
  );
}

function Hero({ name }: { name: string }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 p-7 shadow-xl shadow-orange-200/50 md:p-9">
      {/* Playful blobs */}
      <div className="pointer-events-none absolute -left-8 -top-10 size-44 rounded-full bg-white/20 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/3 size-36 rounded-full bg-pink-300/30 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 right-10 size-28 rounded-full bg-sky-300/30 blur-2xl" />

      <div className="relative flex flex-col items-center gap-6 md:flex-row md:justify-between">
        <div className="max-w-xl text-center md:text-left">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/85">
            {timeGreeting()}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold leading-tight text-white md:text-4xl">
            Welkom terug  {name}! <span className="inline-block"></span>
          </h1>
          <p className="mt-2 text-sm text-white/90 md:text-base">
            Hier groeien je hoogbegaafde leerlingen. Bekijk hun voortgang en laat
            Juf Aimee helpen met opdrachten op maat.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">
            <Link
              href="/students"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-orange-600 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Users className="size-4" />
              Leerling Portaal
            </Link>
            <Link
              href="/dashboard/chat"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-inset ring-white/40 backdrop-blur transition hover:bg-white/25"
            >
              <Sparkles className="size-4" />
              Vraag Juf Aimee
            </Link>
          </div>
        </div>

        {/* Juf Aimee portrait */}
        <div className="relative size-40 shrink-0 md:size-52">
          <div className="absolute inset-0 rounded-full bg-white/90 shadow-2xl ring-8 ring-white/25" />
          <Image
            src={heroImage}
            alt="Juf Aimee"
            fill
            sizes="(min-width: 768px) 208px, 160px"
            className="rounded-full object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}

function SectionTitle({
  title,
  subtitle,
  accent = "bg-orange-400",
}: {
  title: string;
  subtitle?: string;
  accent?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className={`mt-1 h-6 w-1.5 rounded-full ${accent}`} />
      <div className="space-y-0.5">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  chip,
  valueColor,
  sample = false,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  chip: string;
  valueColor: string;
  sample?: boolean;
}) {
  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`mb-3 inline-flex size-11 items-center justify-center rounded-xl ${chip}`}>
        {icon}
      </div>
      <div className={`text-3xl font-extrabold ${valueColor}`}>{value}</div>
      <p className="mt-0.5 text-xs font-medium text-gray-500">{label}</p>
      {sample && <SampleTag className="mt-2" />}
    </div>
  );
}

function ActionTile({
  href,
  image,
  title,
  desc,
  chip,
}: {
  href: string;
  image: StaticImageData;
  title: string;
  desc: string;
  chip: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className={`relative size-16 shrink-0 overflow-hidden rounded-2xl ${chip}`}>
        <Image src={image} alt="" fill sizes="64px" className="object-contain" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <p className="truncate text-xs text-gray-500">{desc}</p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-orange-500" />
    </Link>
  );
}

function InsightCard({
  icon,
  title,
  children,
  chip,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  chip: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className={`inline-flex size-9 items-center justify-center rounded-lg ${chip}`}>
          {icon}
        </span>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

/** Rotating accent palette so the student grid feels colourful and mixed. */
const STUDENT_ACCENTS = [
  {
    strip: "from-orange-500 via-orange-400 to-amber-300",
    tile: "bg-orange-100",
    text: "text-orange-600",
    track: "bg-orange-100",
    fill: "from-orange-500 to-amber-400",
    pill: "border-orange-100 bg-orange-50 text-orange-700",
    btn: "from-orange-500 to-amber-400",
  },
  {
    strip: "from-violet-500 via-violet-400 to-purple-300",
    tile: "bg-violet-100",
    text: "text-violet-600",
    track: "bg-violet-100",
    fill: "from-violet-500 to-purple-400",
    pill: "border-violet-100 bg-violet-50 text-violet-700",
    btn: "from-violet-500 to-purple-400",
  },
  {
    strip: "from-sky-500 via-sky-400 to-blue-300",
    tile: "bg-sky-100",
    text: "text-sky-600",
    track: "bg-sky-100",
    fill: "from-sky-500 to-blue-400",
    pill: "border-sky-100 bg-sky-50 text-sky-700",
    btn: "from-sky-500 to-blue-400",
  },
  {
    strip: "from-emerald-500 via-emerald-400 to-teal-300",
    tile: "bg-emerald-100",
    text: "text-emerald-600",
    track: "bg-emerald-100",
    fill: "from-emerald-500 to-teal-400",
    pill: "border-emerald-100 bg-emerald-50 text-emerald-700",
    btn: "from-emerald-500 to-teal-400",
  },
  {
    strip: "from-pink-500 via-pink-400 to-rose-300",
    tile: "bg-pink-100",
    text: "text-pink-600",
    track: "bg-pink-100",
    fill: "from-pink-500 to-rose-400",
    pill: "border-pink-100 bg-pink-50 text-pink-700",
    btn: "from-pink-500 to-rose-400",
  },
] as const;

function StudentCard({
  student,
  accent,
}: {
  student: Awaited<ReturnType<typeof getDashboardStudents>>[number];
  accent: (typeof STUDENT_ACCENTS)[number];
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className={`h-1.5 bg-gradient-to-r ${accent.strip}`} />
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-12 items-center justify-center rounded-2xl text-3xl ${accent.tile}`}
            >
              {student.emoji}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{student.name}</h3>
              <p className="text-sm text-gray-500">
                {student.age ? `${student.age} jaar` : "Leeftijd onbekend"}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${student.badge.badgeClassName}`}
          >
            <span>{student.badge.badgeEmoji}</span>
            {student.status}
          </span>
        </div>

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-gray-600">Voortgang</span>
            <span className="font-medium text-gray-800">{student.progress}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gray-800 transition-all"
              style={{ width: `${student.progress}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-500">
            
            </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-600">Interesses:</p>
          <div className="flex flex-wrap gap-2">
            {student.interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {student.signals.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-xs">
            <div className="flex flex-col gap-1.5">
              {student.signals.map((signal) => {
                const isWarning = signal.variant === "warning";
                const isPositive = signal.variant === "positive";
                const dotClass = isWarning
                  ? "bg-orange-400"
                  : isPositive
                    ? "bg-green-400"
                    : "bg-blue-400";
                const textClass = isWarning
                  ? "text-orange-800"
                  : isPositive
                    ? "text-green-800"
                    : "text-blue-800";
                return (
                  <div key={signal.type} className="flex items-start gap-2">
                    <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${dotClass}`} />
                    <span className={textClass}>{signal.teacher_message}</span>
                  </div>
                );
              })}
            </div>

            {student.signals[0]?.llm_feedback_advice && (
              <div className="mt-2.5 border-t border-gray-200 pt-2.5 text-gray-600">
                <span className="font-semibold text-purple-700">Juf Aimee: </span>
                {student.signals[0].llm_feedback_advice}
              </div>
            )}

            <details className="group mt-2.5 border-t border-gray-200 pt-2.5">
              <summary className="cursor-pointer list-none text-xs font-medium text-gray-500 hover:text-gray-700">
                <span className="group-open:hidden">💬 Wat denk jij?</span>
                <span className="hidden group-open:inline">💬 Verberg</span>
              </summary>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  await saveTeacherNotes(student.id, formData.get("notes") as string);
                }}
                className="mt-2 flex flex-col gap-1"
              >
                <textarea
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  defaultValue={student.teacherNotes}
                  name="notes"
                  placeholder="Wat denkt u ? Heeft u aanvullende informatie of context die Juf Aimee moet weten? Voeg hier uw eigen notities toe. Deze kunnen helpen voor juf Aimee"
                  rows={2}
                />
                <button
                  className="self-end rounded-lg bg-gray-700 px-3 py-1 text-xs font-medium text-white hover:bg-gray-800"
                  type="submit"
                >
                  Opslaan
                </button>
              </form>
            </details>
          </div>
        )}

          <div className="border-t border-gray-100 pt-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm text-gray-600">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <span className="font-semibold text-gray-800">
                {student.completedAssignments}
              </span>
              van {student.totalAssignments} opdrachten afgerond
            </p>
            <div className="flex gap-2">
              <Link
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                href={`/student/${student.id}`}
              >
                Profiel
              </Link>
              <Link
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r ${accent.btn} px-3 py-2 text-center text-sm font-semibold text-white transition hover:opacity-90`}
                href={`/student/${student.id}/generate`}
              >
                <Sparkles className="size-4" />
                AI Opdracht
              </Link>
              <Link
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                href={`/dashboard/leerling/${student.id}/opdrachten`}
              >
                <ClipboardList className="size-4" />
                Opdrachten
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const [students, teacherName] = await Promise.all([
    getDashboardStudents(),
    getTeacherName(),
  ]);

  const firstStudentId = students[0]?.id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/70 via-white to-slate-50">
      <div className="mx-auto max-w-7xl space-y-10 p-6 md:p-8">
        <Hero name={teacherName} />

        {/* Quick stats */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            icon={<Users className="size-5 text-sky-600" />}
            chip="bg-sky-100"
            label="Totaal leerlingen"
            value={students.length}
            valueColor="text-sky-600"
          />
          <StatCard
            icon={<BookOpen className="size-5 text-orange-600" />}
            chip="bg-orange-100"
            label="Actieve opdrachten"
            value={placeholderDashboardStats.activeAssignments}
            valueColor="text-orange-600"
            sample
          />
          <StatCard
            icon={<CheckCircle2 className="size-5 text-emerald-600" />}
            chip="bg-emerald-100"
            label="Afgerond"
            value={placeholderDashboardStats.completedAssignments}
            valueColor="text-emerald-600"
            sample
          />
          <StatCard
            icon={<Sparkles className="size-5 text-violet-600" />}
            chip="bg-violet-100"
            label="AI-opdrachten"
            value={placeholderDashboardStats.aiAssignments}
            valueColor="text-violet-600"
            sample
          />
        </section>

        {/* Quick actions */}
        <section className="space-y-4 rounded-3xl border border-sky-100 bg-sky-50/70 p-6 md:p-7">
          <SectionTitle
            title="Snel aan de slag"
            subtitle="De belangrijkste tools van Juf Aimee, één tik weg."
            accent="bg-sky-400"
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ActionTile
              href="/dashboard/bronnen"
              image={resourcesImage}
              chip="bg-emerald-50"
              title="Bronnen & Hulp"
              desc="Tips voor sterke opdrachten"
            />
            <ActionTile
              href={
                firstStudentId
                  ? `/student/${firstStudentId}/generate`
                  : "/students"
              }
              image={mathImage}
              chip="bg-orange-50"
              title="Genereer opdracht"
              desc="AI-opdracht op maat maken"
            />
            <ActionTile
              href="/students"
              image={exploreImage}
              chip="bg-sky-50"
              title="Leerling Portaal"
              desc="Bekijk en beheer leerlingen"
            />
          </div>
        </section>

        {/* Insights */}
        <section className="space-y-4 rounded-3xl border border-violet-100 bg-violet-50/60 p-6 md:p-7">
          <SectionTitle
            title="Overzicht & Inzichten"
            subtitle="Een blik op de groei van je groep."
            accent="bg-violet-400"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InsightCard
              icon={<ChartSpline className="size-4 text-emerald-600" />}
              chip="bg-emerald-100"
              title="Gemiddelde voortgang"
            >
              <div className="relative">
                <div className="text-4xl font-extrabold text-emerald-600">
                  {placeholderDashboardStats.averageProgress}%
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Van alle hoogbegaafde leerlingen
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    style={{ width: `${placeholderDashboardStats.averageProgress}%` }}
                  />
                </div>
                <SampleTag className="mt-3" />
                <Image
                  src={celebrateImage}
                  alt=""
                  width={64}
                  height={64}
                  className="absolute -right-1 -top-2 size-14 object-contain opacity-90"
                />
              </div>
            </InsightCard>

            <InsightCard
              icon={<Brain className="size-4 text-violet-600" />}
              chip="bg-violet-100"
              title="Bloom niveaus"
            >
              <div className="space-y-2.5 text-sm">
                {placeholderDashboardStats.bloomCounts.map(({ label, count }) => (
                  <div className="flex items-center justify-between" key={label}>
                    <span className="text-gray-600">{label}</span>
                    <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700">
                      {count} leerling{count !== 1 ? "en" : ""}
                    </span>
                  </div>
                ))}
              </div>
              <SampleTag className="mt-3" />
            </InsightCard>

            <InsightCard
              icon={<Lightbulb className="size-4 text-amber-600" />}
              chip="bg-amber-100"
              title="Top interesses"
            >
              <div className="flex flex-wrap gap-2">
                {placeholderDashboardStats.topInterests.map(({ label, count }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800"
                  >
                    {label}
                    <span className="font-bold text-amber-500">{count}×</span>
                  </span>
                ))}
              </div>
              <SampleTag className="mt-3" />
            </InsightCard>
          </div>

          {/* Attention banner */}
          <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <AlertTriangle className="size-5 text-amber-600" />
            </span>
            <div>
              <p className="text-sm font-bold text-amber-900">
                Lange termijn opdrachten
              </p>
              <p className="mt-0.5 text-sm text-amber-800">
                {placeholderDashboardStats.longRunningAssignments} opdrachten zijn al
                meer dan 7 dagen bezig. Overweeg om contact op te nemen met de
                leerling(en).
              </p>
              <SampleTag className="mt-2" />
            </div>
          </div>
        </section>

        {/* Students */}
        <section className="space-y-4 rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6 md:p-7">
          <SectionTitle
            title="Hoogbegaafde Leerlingen"
            subtitle="Voortgang en AI-gegenereerde opdrachten per leerling."
            accent="bg-emerald-400"
          />

          {students.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-orange-200 bg-white p-12 text-center">
              <Image
                src={emptyImage}
                alt=""
                width={160}
                height={160}
                className="size-40 object-contain"
              />
              <div>
                <p className="text-base font-bold text-gray-800">
                  Nog geen leerlingen
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Zodra er leerlingen zijn toegevoegd, verschijnen ze hier.
                </p>
              </div>
              <Link
                href="/students"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-90"
              >
                <Users className="size-4" />
                Naar Leerling Portaal
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {students.map((student, i) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  accent={STUDENT_ACCENTS[i % STUDENT_ACCENTS.length]}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
