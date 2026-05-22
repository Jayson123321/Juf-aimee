import Image from "next/image";
import { notFound } from "next/navigation";
import aimeePortrait from "@/app/Images/Aimee.png";
import { getPrototypeStudent } from "@/lib/prototype-runtime";
import { BackLink } from "@/components/BackLink";
import { StudentChatClient } from "./StudentChatClient";

export default async function StudentChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getPrototypeStudent(id);

  if (!student) notFound();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.28),transparent_34%),linear-gradient(180deg,#f3f1ff_0%,#e7e3fb_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-[1100px] space-y-5">
        <BackLink href={`/student/${id}/profiel`} label="Terug naar profiel" />

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-600 via-blue-600 to-blue-500 p-6 text-white shadow-xl shadow-violet-300/60">
          <div className="pointer-events-none absolute -left-8 -top-10 size-36 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 right-16 size-32 rounded-full bg-sky-300/30 blur-2xl" />

          <div className="relative flex items-center gap-4">
            <div className="relative size-16 overflow-hidden rounded-2xl bg-white/90 shadow-lg ring-4 ring-white/25">
              <Image
                alt="Juf Aimee"
                className="object-cover"
                fill
                sizes="64px"
                src={aimeePortrait}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Chatten met Juf Aimee
              </h1>
              <p className="mt-0.5 text-sm text-white/85">
                Stel je vraag — Juf Aimee denkt met je mee. 💬
              </p>
            </div>
          </div>
        </section>

        <StudentChatClient studentId={student.id} studentName={student.name} />
      </div>
    </div>
  );
}
