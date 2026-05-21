import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { BackLink } from "@/components/BackLink";
import { updateStudent } from "./actions";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) notFound();

  const action = updateStudent.bind(null, id);

  return (
    <div className="min-h-full bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">

        <BackLink />

        {/* Top actions */}
        <div className="flex items-center justify-between">
          <Button type="submit" form="edit-form">Opslaan</Button>
          <Button asChild variant="outline">
            <Link href={`/student/${id}`}>Annuleren</Link>
          </Button>
        </div>

        <form id="edit-form" action={action} className="space-y-6">

          {/* Persoonlijke gegevens */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
              <User className="size-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-800">Persoonlijke gegevens</h2>
            </div>
            <div className="divide-y divide-slate-100">
              <FormRow label="Volledige naam *" name="fullName" defaultValue={student.fullName} required />
              <div className="flex items-center justify-between px-6 py-3.5">
                <label htmlFor="gender" className="text-sm text-slate-500">Geslacht</label>
                <select
                  id="gender"
                  name="gender"
                  defaultValue={student.gender ?? ""}
                  className="w-56 h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  <option value="">— selecteer —</option>
                  <option value="Man">Man</option>
                  <option value="Vrouw">Vrouw</option>
                  <option value="Anders">Anders</option>
                </select>
              </div>
              <FormRow label="E-mail" name="email" type="email" defaultValue={student.email ?? ""} />
            </div>
          </section>

        </form>
      </div>
    </div>
  );
}

function FormRow({
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
    <div className="flex items-center justify-between px-6 py-3.5">
      <label htmlFor={name} className="text-sm text-slate-500">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="w-56 h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
      />
    </div>
  );
}
