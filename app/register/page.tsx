import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import Link from "next/link";
import Image from "next/image";
import AimeeImage from "@/app/Images/Aimee.png";
import { Mail, Lock } from "lucide-react";

async function register(formData: FormData) {
  "use server";

  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    redirect("/register?error=missing");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/register?error=exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name: email.split("@")[0],
      email,
      password: hashedPassword,
    },
  });

  redirect("/login");
}

type SearchParams = Promise<{ error?: string }>;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error } = await searchParams;

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
          <h2 className="text-orange-400 text-3xl font-bold">Account aanmaken</h2>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="mb-6">
          <h3 className="text-gray-900 text-xl font-bold">Nieuw account</h3>
          <p className="text-gray-500 text-sm mt-1">Maak een leraaraccount aan</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
            {error === "missing"
              ? "Vul alle velden in."
              : "Dit e-mailadres is al in gebruik."}
          </div>
        )}

        <form action={register} className="flex flex-col gap-4">
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
                type="password"
                required
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gray-900 hover:bg-gray-800 transition text-white font-semibold py-3 text-sm mt-1"
          >
            Registreren
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Al een account?{" "}
          <Link href="/login" className="text-orange-400 font-medium hover:underline">
            Inloggen
          </Link>
        </p>
      </div>
    </main>
  );
}
