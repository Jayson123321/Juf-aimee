import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users, BookOpen, CheckCircle2, Clock, GraduationCap,
  TrendingUp, AlertCircle,
} from "lucide-react"

async function getDashboardStats() {
  const [
    studentCount,
    teacherCount,
    pendingCount,
    inProgressCount,
    completedCount,
    recentStudents,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.assignment.count({ where: { status: "PENDING" } }),
    prisma.assignment.count({ where: { status: "IN_PROGRESS" } }),
    prisma.assignment.count({ where: { status: "COMPLETED" } }),
    prisma.student.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        profile: { select: { currentSchoolYearGroup: true, currentTeacher: true } },
      },
    }),
  ])
  return { studentCount, teacherCount, pendingCount, inProgressCount, completedCount, recentStudents }
}

export default async function DashboardPage() {
  const {
    studentCount, teacherCount,
    pendingCount, inProgressCount, completedCount,
    recentStudents,
  } = await getDashboardStats()

  const totalAssignments = pendingCount + inProgressCount + completedCount
  const completionRate = totalAssignments > 0
    ? Math.round((completedCount / totalAssignments) * 100)
    : 0

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Overzicht</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Welkom terug — hier is je dagelijks overzicht
        </p>
      </div>

      {/* ── Bento grid: top row — 4 stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Students — wide card */}
        <Card className="lg:col-span-2 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-md transition-shadow">
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
              <p className="text-3xl font-bold text-foreground tabular-nums">{teacherCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Leraren</p>
            </div>
          </CardContent>
        </Card>

        {/* Completion rate */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col justify-between p-5 h-[140px]">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/30">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground tabular-nums">{completionRate}%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Opdrachten afgerond</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Bento grid: second row — assignment status ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">

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
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className="bg-blue-50/80 dark:bg-blue-900/20 border-blue-200/60 backdrop-blur-sm hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-between p-5 h-[110px]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-100 text-[10px] px-1.5">
                  Bezig
                </Badge>
              </div>
              <p className="text-3xl font-bold text-blue-800 tabular-nums">{inProgressCount}</p>
              <p className="text-xs text-blue-600 mt-0.5">In uitvoering</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">

        {/* Recent students — 2/3 width */}
        <Card className="lg:col-span-2 bg-card/80 backdrop-blur-sm border-border/50">
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
                    <div key={student.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
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
                      </div>
                      {student.profile?.currentSchoolYearGroup && (
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {student.profile.currentSchoolYearGroup}
                        </Badge>
                      )}
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
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            {totalAssignments === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Geen opdrachten</p>
            ) : (
              <>
                <ProgressRow
                  label="Afgerond"
                  count={completedCount}
                  total={totalAssignments}
                  color="bg-emerald-500"
                />
                <ProgressRow
                  label="Bezig"
                  count={inProgressCount}
                  total={totalAssignments}
                  color="bg-blue-500"
                />
                <ProgressRow
                  label="Wachtend"
                  count={pendingCount}
                  total={totalAssignments}
                  color="bg-amber-500"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ProgressRow({
  label,
  count,
  total,
  color,
}: {
  label: string
  count: number
  total: number
  color: string
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground tabular-nums">{count}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
