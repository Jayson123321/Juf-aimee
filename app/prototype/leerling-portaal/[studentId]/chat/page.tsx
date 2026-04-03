import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import aimeePortrait from "@/app/Images/Aimee.png";
import { getPrototypeStudent } from "@/lib/prototype-runtime";
import { StudentChatClient } from "./StudentChatClient";

export default async function PrototypeStudentChatPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const student = await getPrototypeStudent(studentId);

  if (!student) notFound();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(236,236,239,0.9),transparent_32%),linear-gradient(180deg,#fbfbfc_0%,#f4f5f7_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-[1240px]">
        <section className="mb-4 rounded-[18px] border border-slate-200 bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-slate-950"
              href={`/prototype/leerling-portaal/${student.id}`}
            >
              <ArrowLeft className="size-4" />
              Terug naar overzicht
            </Link>

            <div className="flex items-center gap-3">
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
          </div>
        </section>

        <StudentChatClient studentId={student.id} studentName={student.name} />
      </div>
    </div>
  );
}
