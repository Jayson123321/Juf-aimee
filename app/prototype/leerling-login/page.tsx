import Image from "next/image";
import Link from "next/link";
import aimeePortrait from "@/app/Images/Aimee.png";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getPrototypeDashboardStudents } from "@/lib/prototype-runtime";

function StudentLoginCard({
  student,
}: {
  student: Awaited<ReturnType<typeof getPrototypeDashboardStudents>>[number];
}) {
  return (
    <Link
      className="group rounded-[30px] border border-white/70 bg-white/92 p-8 text-center shadow-[0_24px_60px_rgba(103,106,160,0.16)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(103,106,160,0.22)]"
      href={`/prototype/leerling-portaal/${student.id}`}
    >
      <div className="mx-auto mb-5 flex size-28 items-center justify-center rounded-full bg-[linear-gradient(135deg,#fff7ed_0%,#e0ecff_100%)] text-7xl shadow-inner ring-1 ring-slate-200">
        {student.emoji}
      </div>

      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{student.name}</h2>
      <p className="mt-2 text-base text-slate-500">{student.age} jaar</p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {student.interests.slice(0, 3).map((interest) => (
          <span
            key={interest}
            className="rounded-full bg-[linear-gradient(135deg,#f3e8ff_0%,#e0f2fe_100%)] px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-white"
          >
            {interest}
          </span>
        ))}
      </div>
    </Link>
  );
}

export default async function PrototypeStudentLoginPage() {
  const prototypeStudents = await getPrototypeDashboardStudents();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(196,181,253,0.35),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(191,219,254,0.38),transparent_30%),linear-gradient(180deg,#faf7ff_0%,#eff6ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex justify-start">
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white/92 px-4 text-sm font-semibold text-slate-700 shadow-[0_10px_30px_rgba(92,114,180,0.06)] transition hover:bg-white"
            href="/prototype/hoogbegaafde-leerlingen"
          >
            <ArrowLeft className="size-4" />
            Terug naar leerkracht dashboard
          </Link>
        </div>

        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-4 rounded-[32px] border border-white/80 bg-white/90 px-6 py-5 shadow-[0_24px_60px_rgba(103,106,160,0.15)]">
              <div className="relative size-20 overflow-hidden rounded-[26px] border border-white/80 shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
                <Image
                  alt="Juf Aimee"
                  className="object-cover"
                  fill
                  sizes="80px"
                  src={aimeePortrait}
                />
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold tracking-tight text-slate-950">Juf Aimee</h1>
                <p className="text-sm text-slate-600">AI-onderwijsassistent</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-white">
              <Sparkles className="size-4 text-violet-500" />
              Prototype leerlinglogin
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-slate-950">Welkom terug</h2>
            <p className="text-xl text-slate-600">Wie ben jij vandaag?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {prototypeStudents.map((student) => (
            <StudentLoginCard key={student.id} student={student} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            className="text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-700"
            href="/prototype/hoogbegaafde-leerlingen"
          >
            Ben je een leerkracht? Ga terug naar het dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
