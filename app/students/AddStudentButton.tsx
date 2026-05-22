"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, UserPlus, X } from "lucide-react";
import { createStudent } from "./actions";

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-semibold text-gray-700"
      >
        {label}
        {required && <span className="text-orange-500"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
      />
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <UserPlus className="size-4" />
      )}
      {pending ? "Bezig..." : "Student toevoegen"}
    </button>
  );
}

export function AddStudentButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl"
      >
        <UserPlus className="size-4" />
        Nieuwe student
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient header */}
            <div className="relative flex items-center gap-3 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 px-6 py-5 text-white">
              <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-white/20">
                <UserPlus className="size-6" />
              </span>
              <div>
                <h2 className="text-lg font-bold">Nieuwe student</h2>
                <p className="text-xs text-white/85">
                  Voeg een leerling toe aan je groep
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Sluiten"
                className="absolute right-4 top-4 rounded-lg p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Form */}
            <form action={createStudent} className="space-y-4 p-6">
              <Field
                label="Volledige naam"
                name="fullName"
                required
                placeholder="Bijv. Daan de Vries"
              />

              <div>
                <label
                  htmlFor="gender"
                  className="mb-1.5 block text-sm font-semibold text-gray-700"
                >
                  Geslacht
                </label>
                <select
                  id="gender"
                  name="gender"
                  defaultValue=""
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="">— selecteer —</option>
                  <option value="Man">Man</option>
                  <option value="Vrouw">Vrouw</option>
                  <option value="Anders">Anders</option>
                </select>
              </div>

              <Field
                label="E-mailadres"
                name="email"
                type="email"
                placeholder="naam@school.nl"
              />

              <div className="grid grid-cols-2 gap-3">
                <Field label="Jaargroep" name="groep" placeholder="Groep 7" />
                <Field label="Geboortedatum" name="dateOfBirth" type="date" />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Annuleren
                </button>
                <SubmitButton />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
