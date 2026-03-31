import { revalidatePath } from "next/cache";
import Link from "next/link";
import { prisma } from "@/app/lib/db";
import bcrypt from "bcryptjs";


async function createUser(formData: FormData) {
  "use server";

  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  revalidatePath("/");
}

export default async function Home() {
  let users: Awaited<ReturnType<typeof prisma.user.findMany>> = [];
  let databaseError = false;

  try {
    users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch {
    databaseError = true;
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-8 text-zinc-900">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Prisma + Postgres Test</h1>
          <p className="mt-2 text-zinc-600">
            Create a user to verify your Docker PostgreSQL container is working.
          </p>
        </div>

        <section className="rounded-xl border border-fuchsia-200 bg-fuchsia-50 p-5 text-sm text-fuchsia-950">
          <p className="font-semibold">Prototype routes</p>
          <p className="mt-2 text-fuchsia-900/80">
            De eerste frontend-prototype staat nu los van de database klaar.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/prototype"
              className="rounded-lg bg-white px-4 py-2 font-medium text-fuchsia-800 shadow-sm ring-1 ring-fuchsia-200 transition hover:bg-fuchsia-100"
            >
              Open prototype overzicht
            </Link>
            <Link
              href="/prototype/hoogbegaafde-leerlingen"
              className="rounded-lg bg-fuchsia-700 px-4 py-2 font-medium text-white transition hover:bg-fuchsia-800"
            >
              Open leerlingenpagina
            </Link>
          </div>
        </section>

        {databaseError ? (
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
            <p className="font-semibold">Database nog niet beschikbaar</p>
            <p className="mt-2 text-amber-900/80">
              De homepage probeert gebruikers uit PostgreSQL te laden. Dat is
              nog niet nodig voor het prototype, dus gebruik voorlopig de
              prototype-routes hierboven.
            </p>
          </section>
        ) : null}

        <form action={createUser} className="space-y-4 rounded-xl bg-white p-6 shadow">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={databaseError}
            className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90"
          >
            Create user
          </button>
        </form>

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Saved users</h2>

          {databaseError ? (
            <p className="text-zinc-500">
              Database connection unavailable. Prototype pages blijven wel
              bereikbaar.
            </p>
          ) : users.length === 0 ? (
            <p className="text-zinc-500">No users yet.</p>
          ) : (
            <ul className="space-y-3">
              {users.map((user) => (
                <li key={user.id} className="rounded-lg border border-zinc-200 p-3">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-zinc-600">{user.email}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
