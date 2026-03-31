import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";




async function createUser(formData: FormData) {
  "use server";

  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();

  if (!name || !email) {
    throw new Error("Name and email are required.");
  }

  await prisma.user.create({
    data: {
      name: name,
      email,
      password: "password", // In a real app, never hardcode passwords!
    },
  });

  revalidatePath("/");
}

export default async function Home() {


  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Prisma + Postgres Test</h1>
          <p className="mt-2 text-muted-foreground">
            Create a user to verify your Docker PostgreSQL container is working.
          </p>
        </div>

        <form action={createUser} className="space-y-4 rounded-xl bg-card p-6 shadow">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-ring"
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
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-ring"
              placeholder="Enter email"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
          >
            Create user
          </button>
        </form>

        <section className="rounded-xl bg-card p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Saved users</h2>

         
        </section>
      </div>
    </main>
  );
}