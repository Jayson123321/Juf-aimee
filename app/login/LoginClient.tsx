"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AimeeImage from "@/app/Images/Aimee.png";

type Props = {
  action: (formData: FormData) => Promise<void>;
  error?: string;
};

export default function LoginClient({ action, error }: Props) {
  const [showForm, setShowForm] = useState(!!error);

  return (
    <main className="min-h-screen flex items-center justify-center bg-violet-400 p-6">
      <div className="bg-white rounded-3xl shadow-xl flex items-center gap-6 px-10 py-10 max-w-md w-full relative overflow-hidden">
        {!showForm ? (
          /* Splash view */
          <>
            <div className="flex flex-col gap-4 flex-1">
              <div>
                <h1 className="text-3xl font-bold text-zinc-900">Juf Aimee</h1>
                <p className="text-zinc-500 mt-1">AI onderwijsassistent</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="mt-2 w-36 rounded-full bg-violet-400 hover:bg-violet-500 transition text-white font-semibold py-3 text-sm"
              >
                Login
              </button>
            </div>
            <div className="w-36 h-44 relative flex-shrink-0">
              <Image
                src={AimeeImage}
                alt="Juf Aimee"
                fill
                className="object-cover rounded-2xl"
              />
            </div>
          </>
        ) : (
          /* Login form */
          <div className="flex flex-col w-full gap-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="text-zinc-400 hover:text-zinc-600 transition text-xl leading-none"
                aria-label="Back"
              >
                ←
              </button>
              <h2 className="text-xl font-bold text-zinc-900">Inloggen</h2>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error === "missing"
                  ? "Vul alle velden in."
                  : "Ongeldig e-mailadres of wachtwoord."}
              </div>
            )}

            <form action={action} className="flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                  placeholder="jij@voorbeeld.nl"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1">
                  Wachtwoord
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-violet-400 hover:bg-violet-500 transition text-white font-semibold py-3 text-sm mt-1"
              >
                Inloggen
              </button>
            </form>

            <p className="text-center text-sm text-zinc-500 mt-2">
              Nog geen account?{" "}
              <Link href="/register" className="text-violet-500 font-medium hover:underline">
                Registreren
              </Link>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
