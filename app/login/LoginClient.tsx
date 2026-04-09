"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import AimeeImage from "@/app/Images/Aimee.png";

type Props = {
  action: (formData: FormData) => Promise<void>;
  error?: string;
};

export default function LoginClient({ action, error }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#1b2338] p-6 gap-6">
      {/* Logo + title */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-20 h-20 relative rounded-xl overflow-hidden flex-shrink-0">
            <Image src={AimeeImage} alt="Juf Aimee" fill className="object-contain" />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold leading-tight">Juf Aimee</h1>
            <p className="text-gray-400 text-sm">AI-onderwijsassistent</p>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-orange-400 text-3xl font-bold">Welkom bij Juf Aimee</h2>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="mb-6">
          <h3 className="text-gray-900 text-xl font-bold">Welkom terug</h3>
          <p className="text-gray-500 text-sm mt-1">Log in met je account</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
            {error === "missing"
              ? "Vul alle velden in."
              : "Ongeldig e-mailadres of wachtwoord."}
          </div>
        )}

        <form action={action} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              E-mailadres
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                placeholder="jouw@email.nl"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Wachtwoord
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-200 pl-10 pr-10 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                tabIndex={-1}
                aria-label={showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="remember"
                className="w-4 h-4 rounded accent-orange-400"
              />
              <span className="text-gray-700">Onthoud mij</span>
            </label>
            <a href="#" className="text-orange-400 hover:underline text-sm">
              Wachtwoord vergeten?
            </a>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gray-900 hover:bg-gray-800 transition text-white font-semibold py-3 text-sm mt-1"
          >
            Inloggen
          </button>
        </form>

      </div>
    </main>
  );
}
