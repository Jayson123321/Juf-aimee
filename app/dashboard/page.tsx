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
  calculateStudentProgress,
  getBloomAppearance,
  getBloomLevelLabel,
  getStudentAge,
  getStudentPresentation,
} from "@/lib/student-presentation";

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
      assignments: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: {
      fullName: "asc",
    },
  });

  return students.map((student) => {
    const presentation = getStudentPresentation(student.fullName);
    const bloomLabel = getBloomLevelLabel(student.bloomNiveau);
    const completedAssignments = student.assignments.filter(
      (assignment) => assignment.status === "COMPLETED"
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

      {/* ── Bento grid: top row — 4 stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {/* Students — wide card */}
        <Card className="col-span-2 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-between p-6 h-[140px]">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Totaal studenten</p>
              <p className="text-5xl font-bold text-foreground mt-1 tabular-nums">{studentCount}</p>
              <p className="text-xs text-muted-foreground mt-2">Ingeschreven dit schooljaar</p>
            </div>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "oklch(0.28 0.09 255 / 0.08)" }}
            >
              <Users className="w-8 h-8" style={{ color: "oklch(0.28 0.09 255)" }} />
            </div>
          </CardContent>
        </Card>

        {/* Teachers */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col justify-between p-5 h-[140px]">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/30">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
            </div>
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
          </CardContent>
        </Card>
      </div>

      {/* ── Bento grid: second row — assignment status ── */}
      <div className="grid grid-cols-3 gap-4 mt-4">

        {/* Pending */}
        <Card className="bg-amber-50/80 dark:bg-amber-900/20 border-amber-200/60 backdrop-blur-sm hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-between p-5 h-[110px]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-100 text-[10px] px-1.5">
                  Te doen
                </Badge>
              </div>
              <p className="text-3xl font-bold text-amber-800 tabular-nums">{pendingCount}</p>
              <p className="text-xs text-amber-600 mt-0.5">Wachtende opdrachten</p>
            </div>
            <PlaceholderLabel className="mt-3" />
          </OverviewCard>

          <OverviewCard icon={<Sparkles className="size-4 text-gray-400" />} title="AI Opdrachten">
            <div className="text-2xl font-bold text-gray-800">
              {placeholderDashboardStats.aiAssignments}
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-200/60 backdrop-blur-sm hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-between p-5 h-[110px]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-100 text-[10px] px-1.5">
                  Klaar
                </Badge>
              </div>
              <p className="text-3xl font-bold text-emerald-800 tabular-nums">{completedCount}</p>
              <p className="text-xs text-emerald-600 mt-0.5">Afgeronde opdrachten</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Bento grid: third row — recent students + progress ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

        {/* Recent students — 2/3 width */}
        <Card className="md:col-span-2 bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2 pt-5 px-5">
            <CardTitle className="text-sm font-semibold">Recente studenten</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {recentStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">Geen studenten gevonden</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {recentStudents.map((student) => {
                  const initials = student.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                  return (
                    <div key={student.id} className="py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-primary-foreground shrink-0"
                          style={{ backgroundColor: "oklch(0.28 0.09 255)" }}
                        >
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{student.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {student.profile?.currentTeacher ?? "Geen leraar"}
                          </p>
                          <a href={`/student/${student.id}`}>Open profiel</a>
                        </div>
                        {student.profile?.currentSchoolYearGroup && (
                          <Badge variant="secondary" className="text-[10px] shrink-0">
                            {student.profile.currentSchoolYearGroup}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignment progress bars — 1/3 width */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2 pt-5 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Opdrachten</CardTitle>
              <span className="text-xs text-muted-foreground tabular-nums">{totalAssignments} totaal</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
