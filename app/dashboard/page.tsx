import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { prisma } from "@/lib/db";
import aimeePortrait from "@/app/Images/Aimee.png";
import {
  AlertTriangle,
  BookOpen,
  Brain,
  ChartSpline,
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
  totalStudents: 4,
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
        },
      },
    },
    orderBy: {
      fullName: "asc",
    },
  });

  return students.map((student) => {
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
    };
  });
}

function PlaceholderLabel({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 ${className}`}
    >
      Placeholder
    </span>
  );
}

function Header() {
  return (
    <div className="flex flex-col items-center gap-4 border-b border-gray-200 pb-8">
      <div className="flex items-center gap-4">
        <div className="relative size-20 overflow-hidden rounded-2xl shadow-lg">
          <Image
            alt="Juf Aimee"
            className="object-cover"
            fill
            sizes="80px"
            src={aimeePortrait}
          />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Juf Aimee</h1>
          <p className="text-sm text-gray-600">AI-onderwijsassistent</p>
        </div>
      </div>
      <p className="text-sm text-gray-500">
        Dashboard voor leerkrachten - Hoogbegaafde leerlingen
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50">
          <BookOpen className="size-4" />
          Bronnen Bibliotheek (RAG)
        </button>
        <Link
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-200"
          href="/students"
        >
          <Users className="size-4" />
          Leerling Portaal
        </Link>
      </div>
      <p className="text-xs text-amber-700">
        De cijfers in de overzichtskaarten hieronder zijn placeholder-data uit het design.
      </p>
    </div>
  );
}

function OverviewCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-3">
        {icon}
        <h3 className="text-sm font-medium text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StudentCard({
  student,
}: {
  student: Awaited<ReturnType<typeof getDashboardStudents>>[number];
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{student.emoji}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{student.name}</h3>
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

        <div className="border-t border-gray-200 pt-3">
          <p className="mb-3 text-sm text-gray-600">
            {student.completedAssignments} van {student.totalAssignments} opdrachten afgerond
          </p>
          <div className="flex gap-2">
            <Link
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-800 transition hover:bg-gray-50"
              href={`/student/${student.id}`}
            >
              Profiel
            </Link>
            <Link
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-gray-800"
              href={`/student/${student.id}/generate`}
            >
              <Sparkles className="size-4" />
              AI Opdracht
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const students = await getDashboardStudents();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl space-y-8 p-8">
        <Header />

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-800">Overzicht & Inzichten</h2>
            <p className="text-sm text-gray-500">
              Dit deel volgt je design. De cijfers hieronder zijn nog placeholders totdat we ze
              aan echte data koppelen.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <OverviewCard
              icon={<ChartSpline className="size-4 text-gray-800" />}
              title="Gemiddelde Voortgang"
            >
              <div className="text-3xl font-bold text-green-600">
                {placeholderDashboardStats.averageProgress}%
              </div>
              <p className="mt-1 text-xs text-gray-500">Van alle hoogbegaafde leerlingen</p>
              <PlaceholderLabel className="mt-3" />
            </OverviewCard>

            <OverviewCard icon={<Brain className="size-4 text-gray-800" />} title="Bloom Niveaus">
              <div className="space-y-2 text-xs">
                {placeholderDashboardStats.bloomCounts.map(({ label, count }) => (
                  <div className="flex justify-between" key={label}>
                    <span className="text-gray-800">{label}:</span>
                    <span className="font-semibold text-gray-800">
                      {count} leerling{count !== 1 ? "en" : ""}
                    </span>
                  </div>
                ))}
              </div>
              <PlaceholderLabel className="mt-3" />
            </OverviewCard>

            <OverviewCard
              icon={<Lightbulb className="size-4 text-gray-800" />}
              title="Top Interesses"
            >
              <div className="space-y-2 text-xs">
                {placeholderDashboardStats.topInterests.map(({ label, count }) => (
                  <div className="flex justify-between" key={label}>
                    <span className="text-gray-800">{label}:</span>
                    <span className="font-semibold text-gray-800">{count}x</span>
                  </div>
                ))}
              </div>
              <PlaceholderLabel className="mt-3" />
            </OverviewCard>
          </div>

          <div className="flex items-start gap-4 rounded-lg border border-red-200 bg-white p-4">
            <AlertTriangle className="mt-0.5 size-4 flex-shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-bold text-red-700">Lange termijn opdrachten:</p>
              <p className="text-sm text-red-700">
                {placeholderDashboardStats.longRunningAssignments} opdrachten zijn al meer dan 7
                dagen bezig. Overweeg om contact op te nemen met de leerling(en).
              </p>
              <PlaceholderLabel className="mt-2" />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <OverviewCard icon={<Users className="size-4 text-gray-400" />} title="Totaal Leerlingen">
            <div className="text-2xl font-bold text-gray-800">
              {placeholderDashboardStats.totalStudents}
            </div>
            <PlaceholderLabel className="mt-3" />
          </OverviewCard>

          <OverviewCard
            icon={<BookOpen className="size-4 text-gray-400" />}
            title="Actieve Opdrachten"
          >
            <div className="text-2xl font-bold text-gray-800">
              {placeholderDashboardStats.activeAssignments}
            </div>
            <PlaceholderLabel className="mt-3" />
          </OverviewCard>

          <OverviewCard icon={<ChartSpline className="size-4 text-gray-400" />} title="Afgerond">
            <div className="text-2xl font-bold text-gray-800">
              {placeholderDashboardStats.completedAssignments}
            </div>
            <PlaceholderLabel className="mt-3" />
          </OverviewCard>

          <OverviewCard icon={<Sparkles className="size-4 text-gray-400" />} title="AI Opdrachten">
            <div className="text-2xl font-bold text-gray-800">
              {placeholderDashboardStats.aiAssignments}
            </div>
            <PlaceholderLabel className="mt-3" />
          </OverviewCard>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Hoogbegaafde Leerlingen</h2>
          <p className="text-sm text-gray-500">
            Overzicht van leerlingen met hun voortgang en AI-gegenereerde opdrachten
          </p>

          {students.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
              Nog geen leerlingen gevonden.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {students.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
