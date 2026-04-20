import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, MapPin, GraduationCap, Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

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

  return (
    <div className="min-h-full bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">

        <Button asChild variant="outline" className="w-full border-2 border-slate-300 hover:border-slate-400">
          <Link href={`/student/${id}/edit`} className="flex items-center justify-center gap-2">
            <Pencil className="size-4" />
            Profiel bewerken
          </Link>
        </Button>

        {/* Persoonlijke gegevens */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
            <User className="size-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-800">Persoonlijke gegevens</h2>
          </div>
          <dl className="divide-y divide-slate-100">
            <ProfileRow label="Naam" value={student.fullName} />
            <ProfileRow label="Geboortedatum" value={dob} />
            <ProfileRow label="Geslacht" value={student.gender} />
            <ProfileRow label="E-mail" value={student.email} />
            <ProfileRow label="Telefoon" value={student.phoneNumber} />
          </dl>
        </section>

        {/* Adres */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
            <MapPin className="size-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-800">Adres</h2>
          </div>
          <dl className="divide-y divide-slate-100">
            <ProfileRow label="Straat" value={student.addressLine} />
            <ProfileRow label="Postcode" value={student.postalCode} />
            <ProfileRow label="Stad" value={student.city} />
          </dl>
        </section>

        {/* Schoolgegevens */}
        {student.profile && (
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
              <GraduationCap className="size-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-800">Schoolgegevens</h2>
            </div>
            <dl className="divide-y divide-slate-100">
              <ProfileRow label="Registratienummer" value={student.profile.registrationNumber} />
              <ProfileRow label="Schooljaar" value={student.profile.currentSchoolYearGroup} />
              <ProfileRow label="Huidige docent" value={student.profile.currentTeacher} />
              <ProfileRow label="School van herkomst" value={student.profile.schoolOfOrigin} />
            </dl>
          </section>
        )}

      </div>
    </div>
  );
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">
        {value ?? <span className="text-slate-400 italic">—</span>}
      </dd>
    </div>
  );
}
