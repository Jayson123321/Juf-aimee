import { notFound } from "next/navigation";
import { bloomOptions, getPrototypeStudent } from "@/lib/prototype-runtime";
import { AiAssignmentClient } from "./AiAssignmentClient";

export const dynamic = "force-dynamic";

export default async function GenerateAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getPrototypeStudent(id);

  if (!student) notFound();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(171,194,255,0.2),transparent_30%),linear-gradient(180deg,#f7f9ff_0%,#eef4ff_100%)] px-6 py-10 lg:px-8">
      <div className="mx-auto max-w-[1120px] space-y-8">
        <AiAssignmentClient bloomOptions={bloomOptions} student={student} />
      </div>
    </div>
  );
}
