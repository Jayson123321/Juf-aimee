import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { User, MapPin, GraduationCap, Pencil } from "lucide-react";
import { BackLink } from "@/components/BackLink";

export const dynamic = "force-dynamic";

const TONES = {
  violet: {
    card: "border-violet-200/80 bg-violet-50/70",
    header: "bg-gradient-to-r from-violet-600 to-purple-500",
    label: "text-violet-700",
  },
  sky: {
    card: "border-sky-200/80 bg-sky-50/70",
    header: "bg-gradient-to-r from-sky-600 to-blue-500",
    label: "text-sky-700",
  },
  emerald: {
    card: "border-emerald-200/80 bg-emerald-50/70",
    header: "bg-gradient-to-r from-emerald-600 to-teal-500",
    label: "text-emerald-700",
  },
} as const;

type Tone = keyof typeof TONES;
type FieldData = { label: string; value: string | null | undefined };

function InfoSection({
  tone,
  icon,
  title,
  fields,
}: {
  tone: Tone;
  icon: ReactNode;
  title: string;
  fields: FieldData[];
}) {
  const t = TONES[tone];
  return (
    <section
      className={`overflow-hidden rounded-[28px] border shadow-[0_18px_50px_rgba(92,114,180,0.12)] ${t.card}`}
    >
      <div className={`flex items-center gap-3 px-6 py-4 text-white ${t.header}`}>
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
          {icon}
        </span>
        <h2 className="text-base font-bold">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-3 px-6 py-6 sm:grid-cols-2">
        {fields.map((f) => (
          <div
            key={f.label}
            className="rounded-xl border border-slate-100 bg-white px-4 py-3"
          >
            <p className={`text-xs font-bold ${t.label}`}>{f.label}</p>
            <p className="mt-0.5 text-sm font-medium text-slate-900">
              {f.value || (
                <span className="italic text-slate-400">Niet ingevuld</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: { profile: true },
  });

  if (!student) notFound();

  const dob = student.dateOfBirth
    ? new Date(student.dateOfBirth).toLocaleDateString("nl-NL")
    : null;

  const initials = student.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.28),transparent_34%),linear-gradient(180deg,#f3f1ff_0%,#e7e3fb_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <BackLink href={`/student/${id}/profiel`} label="Terug naar profiel" />

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-600 via-blue-600 to-blue-500 p-7 text-white shadow-xl shadow-violet-300/60">
          <div className="pointer-events-none absolute -left-8 -top-10 size-40 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 right-16 size-36 rounded-full bg-sky-300/30 blur-2xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-white/15 text-xl font-extrabold shadow-inner ring-1 ring-white/20">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-white/85">
                  Instellingen
                </p>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {student.fullName}
                </h1>
              </div>
            </div>
            <Link
              href={`/student/${id}/edit`}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-violet-600 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Pencil className="size-4" />
              Profiel bewerken
            </Link>
          </div>
        </section>

        <InfoSection
          tone="violet"
          icon={<User className="size-5" />}
          title="Persoonlijke gegevens"
          fields={[
            { label: "Naam", value: student.fullName },
            { label: "Geboortedatum", value: dob },
            { label: "Geslacht", value: student.gender },
            { label: "E-mailadres", value: student.email },
            { label: "Telefoonnummer", value: student.phoneNumber },
          ]}
        />

        <InfoSection
          tone="sky"
          icon={<MapPin className="size-5" />}
          title="Adres"
          fields={[
            { label: "Straat", value: student.addressLine },
            { label: "Postcode", value: student.postalCode },
            { label: "Stad", value: student.city },
          ]}
        />

        {student.profile && (
          <InfoSection
            tone="emerald"
            icon={<GraduationCap className="size-5" />}
            title="Schoolgegevens"
            fields={[
              {
                label: "Registratienummer",
                value: student.profile.registrationNumber,
              },
              {
                label: "Schooljaar",
                value: student.profile.currentSchoolYearGroup,
              },
              {
                label: "Huidige docent",
                value: student.profile.currentTeacher,
              },
              {
                label: "School van herkomst",
                value: student.profile.schoolOfOrigin,
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}
