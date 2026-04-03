import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Juf Aimee</h1>
          <p className="text-muted-foreground">
            De Prisma test-homepage is tijdelijk uitgezet zodat de app niet crasht als de database
            nog niet bereikbaar is.
          </p>
        </div>

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Routes</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
            >
              Open dashboard
            </Link>
            <Link
              href="/prototype/hoogbegaafde-leerlingen"
              className="rounded-lg border border-border px-4 py-2 hover:bg-muted"
            >
              Open prototype-route
            </Link>
            <Link
              href="/students"
              className="rounded-lg border border-border px-4 py-2 hover:bg-muted"
            >
              Open leerlingen
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="font-medium">Database status</p>
          <p className="mt-2">
            Er is nu expres geen actie op deze homepage die Prisma aanspreekt. De databaseverbinding
            zelf heb ik hier niet opnieuw ingesteld of gerepareerd.
          </p>
        </section>
      </div>
    </main>
  );
}
