import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, Pencil, User } from "lucide-react";
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
    <div className="min-h-full bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.28),transparent_34%),linear-gradient(180deg,#f3f1ff_0%,#e7e3fb_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <BackLink href={`/student/${id}`} label="Terug naar instellingen" />

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-600 via-blue-600 to-blue-500 p-7 text-white shadow-xl shadow-violet-300/60">
          <div className="pointer-events-none absolute -left-8 -top-10 size-40 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 right-16 size-36 rounded-full bg-sky-300/30 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white/15 shadow-inner ring-1 ring-white/20">
              <Pencil className="size-7" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-white/85">
                Profiel bewerken
              </p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {student.fullName}
              </h1>
            </div>
          </div>
        </section>

        <form action={action} className="space-y-6">
          {/* Persoonlijke gegevens */}
          <section className="overflow-hidden rounded-[28px] border border-violet-200/80 bg-violet-50/70 shadow-[0_18px_50px_rgba(92,114,180,0.12)]">
            <div className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-purple-500 px-6 py-4 text-white">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <User className="size-5" />
              </span>
              <h2 className="text-base font-bold">Persoonlijke gegevens</h2>
            </div>
            <div className="space-y-4 px-6 py-6">
              <FormRow
                label="Volledige naam"
                name="fullName"
                defaultValue={student.fullName}
                required
              />
              <div>
                <label
                  htmlFor="gender"
                  className="mb-1.5 block text-sm font-bold text-violet-700"
                >
                  Geslacht
                </label>
                <select
                  id="gender"
                  name="gender"
                  defaultValue={student.gender ?? ""}
                  className="w-full rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                >
                  <option value="">— selecteer —</option>
                  <option value="Man">Man</option>
                  <option value="Vrouw">Vrouw</option>
                  <option value="Anders">Anders</option>
                </select>
              </div>
              <FormRow
                label="E-mailadres"
                name="email"
                type="email"
                defaultValue={student.email ?? ""}
              />
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href={`/student/${id}`}
              className="flex flex-1 items-center justify-center rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-violet-50"
            >
              Annuleren
            </Link>
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:opacity-90"
            >
              <Check className="size-4" />
              Opslaan
            </button>
          </div>
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
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-bold text-violet-700"
      >
        {label}
        {required && <span className="text-violet-400"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
      />
    </div>
  );
}
