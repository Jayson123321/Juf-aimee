import type { ReactNode } from "react"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { User, Mail, MapPin, CalendarDays } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function StudentsPage() {
  const students = await prisma.student.findMany({
    include: { profile: true },
    orderBy: { fullName: "asc" },
  })

  return (
    <div className="py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Studenten</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {students.length} student{students.length !== 1 ? "en" : ""} geregistreerd
        </p>
      </div>

      {students.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">Geen studenten gevonden.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {students.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  )
}

type StudentWithProfile = Awaited<
  ReturnType<typeof prisma.student.findMany<{ include: { profile: true } }>>
>[number]

function StudentCard({ student }: { student: StudentWithProfile }) {
  const initials = getInitials(student.fullName)
  const dob = student.dateOfBirth
    ? new Date(student.dateOfBirth).toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null

  return (
    <Link href={`/student/${student.id}`} className="group block outline-none">
      <Card className="h-full transition-all duration-200 ease-out group-hover:ring-2 group-hover:ring-primary group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-primary">
        <CardHeader className="flex flex-row items-center gap-4 border-b pb-4">
          <div className="shrink-0 size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base font-semibold tracking-wide transition-transform duration-200 group-hover:scale-105">
            {initials}
          </div>
          <div className="min-w-0">
            <CardTitle className="truncate">{student.fullName}</CardTitle>
            {student.profile?.currentSchoolYearGroup ? (
              <Badge variant="secondary" className="mt-1">
                {student.profile.currentSchoolYearGroup}
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground mt-1 block">Geen jaargroep</span>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <ul className="space-y-2.5">
            <InfoRow icon={<User className="size-4" />} label={student.profile?.currentTeacher ?? "—"} />
            <InfoRow icon={<Mail className="size-4" />} label={student.email ?? "—"} />
            {student.city && (
              <InfoRow
                icon={<MapPin className="size-4" />}
                label={[student.city, student.postalCode].filter(Boolean).join("  ·  ")}
              />
            )}
            {dob && <InfoRow icon={<CalendarDays className="size-4" />} label={dob} />}
          </ul>
        </CardContent>

        {student.profile?.registrationNumber && (
          <CardFooter>
            <span className="text-xs text-muted-foreground font-mono">
              {student.profile.registrationNumber}
            </span>
          </CardFooter>
        )}
      </Card>
    </Link>
  )
}

function InfoRow({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
      <span className="shrink-0 text-primary/60">{icon}</span>
      <span className="truncate">{label}</span>
    </li>
  )
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
