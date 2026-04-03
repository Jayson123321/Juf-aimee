import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  bloomOptions,
  getPrototypeStudent,
} from "@/lib/prototype-runtime";
import { PrototypeAiAssignmentClient } from "./PrototypeAiAssignmentClient";

export default async function PrototypeAiAssignmentPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const student = await getPrototypeStudent(studentId);

  if (!student) notFound();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(171,194,255,0.2),transparent_30%),linear-gradient(180deg,#f7f9ff_0%,#eef4ff_100%)] px-6 py-10 lg:px-8">
      <div className="mx-auto max-w-[1120px] space-y-8">
        <Link
          className="inline-flex items-center gap-3 text-[1.05rem] font-medium text-slate-900 transition hover:text-slate-700"
          href={`/prototype/hoogbegaafde-leerlingen/${student.id}/profiel`}
        >
          <ArrowLeft className="size-5" />
          Terug naar profiel
        </Link>

        <PrototypeAiAssignmentClient bloomOptions={bloomOptions} student={student} />
      </div>
    </div>
  );
}
