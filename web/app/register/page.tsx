import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import Link from "next/link";

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
    <main className="min-h-screen flex items-center justify-center bg-violet-400 p-6">
      <div className="bg-white rounded-3xl shadow-xl px-10 py-10 max-w-sm w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">Account aanmaken</h1>
          <p className="text-zinc-500 text-sm mt-1">Juf Aimee — AI onderwijsassistent</p>
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
              autoComplete="new-password"
              className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-violet-400 hover:bg-violet-500 transition text-white font-semibold py-3 text-sm mt-1"
          >
            Registreren
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-5">
          Al een account?{" "}
          <Link href="/login" className="text-violet-500 font-medium hover:underline">
            Inloggen
          </Link>
        </p>
      </div>
    </main>
  );
}
