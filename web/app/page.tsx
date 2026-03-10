import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/db";




async function createUser(formData: FormData) {
  "use server";

  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();

  if (!name || !email) {
    throw new Error("Name and email are required.");
  }

  await prisma.user.create({
    data: {
      name,
      email,
    },
  });

  revalidatePath("/");
}

export default async function Home() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-zinc-50 p-8 text-zinc-900">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Prisma + Postgres Test</h1>
          <p className="mt-2 text-zinc-600">
            Create a user to verify your Docker PostgreSQL container is working.
          </p>
        </div>

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

          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90"
          >
            Create user
          </button>
        </form>

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Saved users</h2>

          {users.length === 0 ? (
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