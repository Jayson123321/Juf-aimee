import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import aimeePortrait from "@/app/Images/Aimee.png";
import {
  BookOpen,
  CheckCircle2,
  LogOut,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import {
  getPrototypeAssignments,
  getPrototypeStudent,
} from "@/lib/prototype-runtime";

function PortalStatCard({
  emoji,
  value,
  label,
  className,
}: {
  emoji: string;
  value: string | number;
  label: string;
  className: string;
}) {
  return (
    <div className={`rounded-[24px] p-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.12)] ${className}`}>
      <div className="mb-3 text-4xl">{emoji}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="mt-1 text-sm font-medium text-white/90">{label}</div>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
  badge,
  tint,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  tint: string;
}) {
  return (
    <Link
      className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(106,124,167,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(106,124,167,0.14)]"
      href={href}
    >
      <div
        className={`absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${tint}`}
      />
      <div className="relative">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="text-slate-700">{icon}</div>
          {badge ? (
            <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">
              {badge}
            </span>
          ) : null}
        </div>
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </Link>
  );
}

export default async function PrototypeStudentPortalPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const student = await getPrototypeStudent(studentId);

  if (!student) notFound();

  const assignments = await getPrototypeAssignments(studentId);
  const activeAssignments = assignments.filter(
    (assignment) => assignment.status === "in_progress" || assignment.status === "not_started",
  );
  const completedCount = assignments.filter((assignment) => assignment.status === "completed").length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(196,181,253,0.28),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(191,219,254,0.3),transparent_30%),linear-gradient(180deg,#faf7ff_0%,#eef5ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="mb-6 rounded-[28px] border border-white/80 bg-white/92 p-6 shadow-[0_24px_60px_rgba(103,106,160,0.14)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#fff7ed_0%,#e0ecff_100%)] text-5xl shadow-inner ring-1 ring-slate-200">
                {student.emoji}
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                  Hallo {student.name.split(" ")[0]}
                </h1>
                <p className="mt-1 text-sm text-slate-500">Leuk dat je er bent!</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="relative size-12 overflow-hidden rounded-2xl shadow-sm">
                  <Image
                    alt="Juf Aimee"
                    className="object-cover"
                    fill
                    sizes="48px"
                    src={aimeePortrait}
                  />
                </div>
                <div>
                  <h2 className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-xl font-bold text-transparent">
                    Juf Aimee
                  </h2>
                  <p className="text-xs text-slate-500">AI-onderwijsassistent</p>
                </div>
              </div>

              <Link
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                href="/prototype/leerling-login"
              >
                <LogOut className="size-4" />
                Uitloggen
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <PortalStatCard
            className="bg-gradient-to-br from-amber-400 to-orange-500"
            emoji="📝"
            label="Nieuwe opdrachten"
            value={activeAssignments.length}
          />
          <PortalStatCard
            className="bg-gradient-to-br from-emerald-400 to-green-500"
            emoji="✅"
            label="Afgerond"
            value={completedCount}
          />
          <PortalStatCard
            className="bg-gradient-to-br from-sky-400 to-cyan-500"
            emoji="⭐"
            label="Voortgang"
            value={`${student.progress}%`}
          />
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <ActionCard
            badge={activeAssignments.length > 0 ? String(activeAssignments.length) : undefined}
            description="Bekijk wat je al hebt gedaan en welke opdrachten je nog kunt maken."
            href={`/prototype/leerling-portaal/${student.id}/opdrachten`}
            icon={<BookOpen className="size-10" />}
            tint="bg-[linear-gradient(135deg,rgba(243,232,255,0.9),rgba(255,255,255,0))]"
            title="Mijn opdrachten"
          />
          <ActionCard
            description="Open een vriendelijke prototype-chatweergave voor vragen en hulp."
            href={`/prototype/hoogbegaafde-leerlingen/${student.id}/ai-opdracht`}
            icon={<MessageCircle className="size-10" />}
            tint="bg-[linear-gradient(135deg,rgba(219,234,254,0.9),rgba(255,255,255,0))]"
            title="Chat met Juf Aimee"
          />
        </section>

        <section className="mb-6 rounded-[24px] border border-white/80 bg-white/92 p-6 shadow-[0_16px_40px_rgba(106,124,167,0.08)]">
          <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-950">
            <Sparkles className="size-5 text-violet-500" />
            Jouw niveau
          </h2>
          <p className="mt-3 text-sm text-slate-500">Je werkt nu op dit niveau:</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-[linear-gradient(135deg,#f3e8ff_0%,#eff6ff_100%)] px-4 py-2 text-base font-semibold text-slate-800">
            <span>{student.badgeEmoji}</span>
            {student.status}
          </div>
        </section>

        <section className="rounded-[24px] border border-white/80 bg-white/92 p-6 shadow-[0_16px_40px_rgba(106,124,167,0.08)]">
          <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-950">
            <CheckCircle2 className="size-5 text-pink-500" />
            Waar jij van houdt
          </h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {student.interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-[linear-gradient(135deg,#f3e8ff_0%,#fde7f3_45%,#e0f2fe_100%)] px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-white"
              >
                {interest}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
