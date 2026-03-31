import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { updateStudent } from "./actions";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) notFound();

  const dobValue = student.dateOfBirth
    ? new Date(student.dateOfBirth).toISOString().split("T")[0]
    : "";

  const action = updateStudent.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profiel bewerken</h1>
        <Button asChild variant="outline" size="sm">
          <Link href={`/student/${id}`}>Annuleren</Link>
        </Button>
      </div>

      <form action={action} className="space-y-6">
        <fieldset className="space-y-4">
          <legend className="text-base font-semibold">Persoonlijke gegevens</legend>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Volledige naam *"
              name="fullName"
              defaultValue={student.fullName}
              required
            />
            <FormField
              label="Geboortedatum"
              name="dateOfBirth"
              type="date"
              defaultValue={dobValue}
            />
            <div className="flex flex-col gap-1">
              <label htmlFor="gender" className="text-sm font-medium">
                Geslacht
              </label>
              <select
                id="gender"
                name="gender"
                defaultValue={student.gender ?? ""}
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                <option value="">— selecteer —</option>
                <option value="Man">Man</option>
                <option value="Vrouw">Vrouw</option>
                <option value="Anders">Anders</option>
              </select>
            </div>
            <FormField
              label="E-mail"
              name="email"
              type="email"
              defaultValue={student.email ?? ""}
            />
            <FormField
              label="Telefoonnummer"
              name="phoneNumber"
              defaultValue={student.phoneNumber ?? ""}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-base font-semibold">Adres</legend>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <FormField
                label="Straat en huisnummer"
                name="addressLine"
                defaultValue={student.addressLine ?? ""}
              />
            </div>
            <FormField
              label="Postcode"
              name="postalCode"
              defaultValue={student.postalCode ?? ""}
            />
            <FormField
              label="Stad"
              name="city"
              defaultValue={student.city ?? ""}
            />
          </div>
        </fieldset>

        <div className="flex gap-3">
          <Button type="submit">Opslaan</Button>
          <Button asChild variant="outline">
            <Link href={`/student/${id}`}>Annuleren</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

function FormField({
  label,
  name,
  type = "text",
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
      />
    </div>
  );
}
