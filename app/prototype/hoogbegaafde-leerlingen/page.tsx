import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  Brain,
  ChartSpline,
  Lightbulb,
  Sparkles,
  Users,
} from "lucide-react";
import aimeePortrait from "@/app/Images/Aimee.png";
import { prototypeDashboardStats, prototypeStudents } from "./prototype-data";

function PlaceholderLabel({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 ${className}`}
    >
      Placeholder
    </span>
  );
}

function Header() {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex items-center gap-4">
        <div className="relative size-20 overflow-hidden rounded-[26px] border border-white/80 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
          <Image
            alt="Juf Aimee"
            className="object-cover"
            fill
            sizes="80px"
            src={aimeePortrait}
          />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Juf Aimee</h1>
          <p className="text-sm text-slate-700">AI-onderwijsassistent</p>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        Prototype voor leerkrachten - Hoogbegaafde leerlingen
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <button className="inline-flex h-12 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-5 text-base font-semibold text-slate-900 shadow-[0_10px_30px_rgba(92,114,180,0.08)] transition hover:bg-white">
          <BookOpen className="size-4" />
          Bronnen Bibliotheek
        </button>
        <button className="inline-flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 text-base font-semibold text-slate-900 shadow-[0_10px_30px_rgba(92,114,180,0.06)] transition hover:bg-slate-100">
          <Users className="size-4" />
          Leerling Portaal
        </button>
      </div>
    </div>
  );
}

function OverviewCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[26px] border border-[rgba(153,164,207,0.28)] bg-white/92 p-6 shadow-[0_18px_50px_rgba(92,114,180,0.08)] backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-[1.15rem] font-semibold text-slate-950">{title}</h3>
        <div className="text-slate-400">{icon}</div>
      </div>
      {children}
    </div>
  );
}

function StudentCard({
  student,
}: {
  student: (typeof prototypeStudents)[number];
}) {
  return (
    <div className="rounded-[28px] border border-[rgba(153,164,207,0.28)] bg-white/94 p-5 shadow-[0_18px_50px_rgba(92,114,180,0.08)] backdrop-blur md:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-slate-100 text-3xl shadow-inner ring-1 ring-slate-200">
            {student.emoji}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[2rem] font-semibold leading-none tracking-tight text-slate-950">
              {student.name}
            </h3>
            <p className="mt-1 text-base text-slate-500">{student.age} jaar</p>
          </div>
        </div>

        <span className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-lg font-semibold text-slate-700 shadow-sm">
          <span aria-hidden="true">{student.badgeEmoji}</span>
          {student.status}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex justify-between text-base">
            <span className="text-slate-700">Voortgang</span>
            <span className="font-semibold text-slate-700">{student.progress}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-500 transition-all"
              style={{ width: `${student.progress}%` }}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-base text-slate-700">Interesses:</p>
          <div className="flex flex-wrap gap-2">
            {student.interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <p className="mb-4 text-base text-slate-600">
            {student.completedAssignments} van {student.totalAssignments} opdrachten afgerond
          </p>

          <div className="flex gap-3">
            <Link
              className="flex h-11 flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-base font-semibold text-slate-900 transition hover:bg-slate-50"
              href={`/prototype/hoogbegaafde-leerlingen/${student.id}/profiel`}
            >
              Profiel
            </Link>
            <Link
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 px-4 text-base font-semibold text-white shadow-[0_12px_24px_rgba(98,101,255,0.22)] transition hover:from-violet-600 hover:to-blue-600"
              href={`/prototype/hoogbegaafde-leerlingen/${student.id}/ai-opdracht`}
            >
              <Sparkles className="size-4" />
              AI Opdracht
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PrototypeHoogbegaafdeLeerlingenPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(171,194,255,0.22),transparent_28%),linear-gradient(180deg,#f7f9ff_0%,#eef4ff_100%)]">
      <div className="mx-auto max-w-[1400px] space-y-8 px-6 py-8 lg:px-8">
        <Header />

        <section className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <OverviewCard icon={<Users className="size-5" />} title="Totaal Leerlingen">
              <div className="text-4xl font-bold text-slate-950">
                {prototypeDashboardStats.totalStudents}
              </div>
            </OverviewCard>

            <OverviewCard icon={<BookOpen className="size-5" />} title="Actieve Opdrachten">
              <div className="text-4xl font-bold text-slate-950">
                {prototypeDashboardStats.activeAssignments}
              </div>
            </OverviewCard>

            <OverviewCard icon={<ChartSpline className="size-5" />} title="Afgerond">
              <div className="text-4xl font-bold text-slate-950">
                {prototypeDashboardStats.completedAssignments}
              </div>
            </OverviewCard>

            <OverviewCard icon={<Sparkles className="size-5" />} title="AI Opdrachten">
              <div className="text-4xl font-bold text-slate-950">
                {prototypeDashboardStats.aiAssignments}
              </div>
            </OverviewCard>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <OverviewCard icon={<Brain className="size-5" />} title="Bloom Niveaus">
              <div className="space-y-3 pt-10 text-sm">
                {prototypeDashboardStats.bloomCounts.map(({ label, count }) => (
                  <div className="flex justify-between" key={label}>
                    <span className="text-slate-700">{label}</span>
                    <span className="font-semibold text-slate-700">{count} lln</span>
                  </div>
                ))}
              </div>
            </OverviewCard>

            <OverviewCard icon={<Lightbulb className="size-5" />} title="Top Interesses">
              <div className="space-y-3 pt-10 text-sm">
                {prototypeDashboardStats.topInterests.map(({ label, count }) => (
                  <div className="flex justify-between" key={label}>
                    <span className="text-slate-700">{label}</span>
                    <span className="font-semibold text-slate-700">{count}{"\u00D7"}</span>
                  </div>
                ))}
              </div>
            </OverviewCard>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <OverviewCard icon={<ChartSpline className="size-5" />} title="Gemiddelde Voortgang">
                <div className="space-y-3">
                  <div className="text-4xl font-bold text-slate-950">
                    {prototypeDashboardStats.averageProgress}%
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-slate-500"
                      style={{ width: `${prototypeDashboardStats.averageProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-500">
                    Placeholderinzichten voor het prototype-overzicht
                  </p>
                  <PlaceholderLabel className="mt-1" />
                </div>
              </OverviewCard>
            </div>

            <div className="flex items-start gap-4 rounded-[26px] border border-amber-100 bg-white/92 p-5 shadow-[0_18px_50px_rgba(92,114,180,0.06)]">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-bold text-slate-900">Lange termijn opdrachten</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {prototypeDashboardStats.longRunningAssignments} opdrachten zijn al meer dan
                  7 dagen bezig. Overweeg om contact op te nemen met de leerling(en).
                </p>
                <PlaceholderLabel className="mt-3" />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-slate-900">Hoogbegaafde Leerlingen</h2>
            <p className="text-sm text-slate-500">
              Volledig placeholder-overzicht voor design, feedback en iteraties
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {prototypeStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
