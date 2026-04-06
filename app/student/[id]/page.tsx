import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{student.fullName}</h1>
        <div className="flex items-center gap-3">
          <Button asChild variant="secondary">
            <Link href={`/student/${id}/generate`}>AI opdracht</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/student/${id}/edit`}>Profiel bewerken</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Persoonlijke gegevens</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <ProfileField label="Naam" value={student.fullName} />
            <ProfileField label="Geboortedatum" value={dob} />
            <ProfileField label="Geslacht" value={student.gender} />
            <ProfileField label="E-mail" value={student.email} />
            <ProfileField label="Telefoon" value={student.phoneNumber} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adres</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <ProfileField label="Straat" value={student.addressLine} />
            <ProfileField label="Postcode" value={student.postalCode} />
            <ProfileField label="Stad" value={student.city} />
          </dl>
        </CardContent>
      </Card>

      {student.profile && (
        <Card>
          <CardHeader>
            <CardTitle>Schoolgegevens</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <ProfileField
                label="Registratienummer"
                value={student.profile.registrationNumber}
              />
              <ProfileField
                label="Schooljaar"
                value={student.profile.currentSchoolYearGroup}
              />
              <ProfileField
                label="Huidige docent"
                value={student.profile.currentTeacher}
              />
              <ProfileField
                label="School van herkomst"
                value={student.profile.schoolOfOrigin}
              />
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProfileField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <>
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd>{value ?? <span className="text-muted-foreground italic">—</span>}</dd>
    </>
  );
}
