import type { ReactNode } from "react";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Mail,
  MapPin,
  CalendarDays,
  Users,
  ArrowRight,
} from "lucide-react";
import emptyImage from "@/app/Images/resources-2.png";
import { BackLink } from "@/components/BackLink";

export const dynamic = "force-dynamic";

/** Rotating accent palette so the card grid feels colourful and alive. */
const ACCENTS = [
  {
    strip: "from-orange-400 to-amber-300",
    avatar: "from-orange-500 to-amber-400",
    hoverBorder: "hover:border-orange-300",
    icon: "text-orange-500",
    soft: "bg-orange-50 text-orange-700",
  },
  {
    strip: "from-sky-400 to-blue-400",
    avatar: "from-sky-500 to-blue-500",
    hoverBorder: "hover:border-sky-300",
    icon: "text-sky-500",
    soft: "bg-sky-50 text-sky-700",
  },
  {
    strip: "from-violet-400 to-purple-400",
    avatar: "from-violet-500 to-purple-500",
    hoverBorder: "hover:border-violet-300",
    icon: "text-violet-500",
    soft: "bg-violet-50 text-violet-700",
  },
  {
    strip: "from-emerald-400 to-teal-400",
    avatar: "from-emerald-500 to-teal-500",
    hoverBorder: "hover:border-emerald-300",
    icon: "text-emerald-500",
    soft: "bg-emerald-50 text-emerald-700",
  },
  {
    strip: "from-pink-400 to-rose-400",
    avatar: "from-pink-500 to-rose-500",
    hoverBorder: "hover:border-pink-300",
    icon: "text-pink-500",
    soft: "bg-pink-50 text-pink-700",
  },
] as const;

export default async function StudentsPage() {
  const students = await prisma.student.findMany({
    include: { profile: true },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/70 via-white to-slate-50">
      <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
        <BackLink />

        {/* Header */}
        <div className="flex items-center gap-4">
          <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 shadow-lg shadow-orange-200">
            <Users className="size-7 text-white" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 md:text-3xl">
              Studenten
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              <span className="font-semibold text-orange-600">
                {students.length}
              </span>{" "}
              leerling{students.length !== 1 ? "en" : ""} geregistreerd
            </p>
          </div>
        </div>

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
                Nog geen studenten
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Zodra er leerlingen zijn toegevoegd, verschijnen ze hier.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {students.map((student, i) => (
              <StudentCard
                key={student.id}
                student={student}
                accent={ACCENTS[i % ACCENTS.length]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type StudentWithProfile = Awaited<
  ReturnType<typeof prisma.student.findMany<{ include: { profile: true } }>>
>[number];

function StudentCard({
  student,
  accent,
}: {
  student: StudentWithProfile;
  accent: (typeof ACCENTS)[number];
}) {
  const initials = getInitials(student.fullName);
  const dob = student.dateOfBirth
    ? new Date(student.dateOfBirth).toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <Link
      href={`/student/${student.id}`}
      className="group block outline-none"
    >
      <div
        className={`flex h-full flex-col overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl ${accent.hoverBorder} group-focus-visible:-translate-y-1 group-focus-visible:shadow-xl`}
      >
        {/* Accent strip */}
        <div className={`h-1.5 bg-gradient-to-r ${accent.strip}`} />

        <div className="flex flex-1 flex-col p-5">
          {/* Header */}
          <div className="flex items-center gap-3.5">
            <div
              className={`flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accent.avatar} text-lg font-bold tracking-wide text-white shadow-md transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-3`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-gray-800">
                {student.fullName}
              </h3>
              {student.profile?.currentSchoolYearGroup ? (
                <span
                  className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${accent.soft}`}
                >
                  {student.profile.currentSchoolYearGroup}
                </span>
              ) : (
                <span className="mt-1 block text-xs text-gray-400">
                  Geen jaargroep
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <ul className="mt-4 space-y-2.5 border-t border-gray-100 pt-4">
            <InfoRow
              icon={<User className="size-4" />}
              accent={accent.icon}
              label={student.profile?.currentTeacher ?? "—"}
            />
            <InfoRow
              icon={<Mail className="size-4" />}
              accent={accent.icon}
              label={student.email ?? "—"}
            />
            {student.city && (
              <InfoRow
                icon={<MapPin className="size-4" />}
                accent={accent.icon}
                label={[student.city, student.postalCode]
                  .filter(Boolean)
                  .join("  ·  ")}
              />
            )}
            {dob && (
              <InfoRow
                icon={<CalendarDays className="size-4" />}
                accent={accent.icon}
                label={dob}
              />
            )}
          </ul>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
            {student.profile?.registrationNumber ? (
              <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-500">
                {student.profile.registrationNumber}
              </span>
            ) : (
              <span />
            )}
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold ${accent.icon} opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 -translate-x-1`}
            >
              Bekijk profiel
              <ArrowRight className="size-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function InfoRow({
  icon,
  label,
  accent,
}: {
  icon: ReactNode;
  label: string;
  accent: string;
}) {
  return (
    <li className="flex items-center gap-2.5 text-sm text-gray-600">
      <span className={`shrink-0 ${accent}`}>{icon}</span>
      <span className="truncate">{label}</span>
    </li>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
