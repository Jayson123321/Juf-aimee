import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import aimeePortrait from "@/app/Images/Aimee.png";
import { BookOpen, LogOut, MessageCircle, Sparkles } from "lucide-react";
import { getPrototypeAssignments, getPrototypeStudent } from "@/lib/prototype-runtime";

function PortalStatCard({
  emoji,
  value,
  label,
}: {
  emoji: string;
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,#f4f3f2_0%,#ddd9d5_100%)] px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
      <div className="mb-3 text-2xl">{emoji}</div>
      <div className="text-2xl font-semibold text-slate-900">{value}</div>
      <div className="mt-1 text-sm text-slate-600">{label}</div>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <Link
      className="relative rounded-[18px] border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
      href={href}
    >
      {badge ? (
        <span className="absolute right-4 top-4 inline-flex min-w-6 items-center justify-center rounded-full bg-[#66615c] px-2 py-0.5 text-xs font-semibold text-white">
          {badge}
        </span>
      ) : null}
      <div className="mb-4 text-slate-400">{icon}</div>
      <h2 className="text-[1.1rem] font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(236,236,239,0.9),transparent_32%),linear-gradient(180deg,#fbfbfc_0%,#f4f5f7_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[760px]">
        <section className="mb-4 rounded-[18px] border border-slate-200 bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-11 items-center justify-center rounded-full bg-[#f5efe5] text-2xl">
                {student.emoji}
              </div>
              <div>
                <h1 className="text-[1.55rem] font-semibold text-slate-950">
                  Hallo {student.name.split(" ")[0]}! 👋
                </h1>
                <p className="text-sm text-slate-500">Leuk dat je er bent!</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-white px-3 py-2">
                <div className="relative size-11 overflow-hidden rounded-xl shadow-sm">
                  <Image
                    alt="Juf Aimee"
                    className="object-cover"
                    fill
                    sizes="44px"
                    src={aimeePortrait}
                  />
                </div>
                <div className="leading-tight">
                  <h2 className="text-base font-semibold text-slate-950">Juf Aimee</h2>
                  <p className="text-xs text-slate-500">AI-onderwijsassistent</p>
                </div>
              </div>

              <Link
                aria-label="Uitloggen"
                className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                href="/prototype/leerling-login"
                title="Uitloggen"
              >
                <LogOut className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <PortalStatCard emoji="📝" label="Nieuwe opdrachten" value={activeAssignments.length} />
          <PortalStatCard emoji="✅" label="Afgerond" value={completedCount} />
          <PortalStatCard emoji="⭐" label="Voortgang" value={`${student.progress}%`} />
        </section>

        <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ActionCard
            badge={activeAssignments.length > 0 ? String(activeAssignments.length) : undefined}
            description="Bekijk en maak je opdrachten"
            href={`/prototype/leerling-portaal/${student.id}/opdrachten`}
            icon={<BookOpen className="size-8" />}
            title="Mijn Opdrachten"
          />
          <ActionCard
            description="Stel vragen en krijg hulp"
            href={`/prototype/leerling-portaal/${student.id}/chat`}
            icon={<MessageCircle className="size-8" />}
            title="Chat met Juf Aimee"
          />
        </section>

        <section className="rounded-[18px] border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
            <Sparkles className="size-4 text-amber-500" />
            Jouw niveau
          </h2>
          <p className="mt-3 text-sm text-slate-500">Je werkt nu op dit niveau:</p>
          <div className="mt-4 h-7 rounded-full bg-[#d7d4d1] px-2">
            <div className="flex h-full items-center gap-2 text-sm font-medium text-slate-800">
              <span>{student.badgeEmoji}</span>
              {student.status}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
