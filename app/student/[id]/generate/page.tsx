import { notFound } from "next/navigation";
import { bloomOptions, getPrototypeStudent } from "@/lib/prototype-runtime";
import { BackLink } from "@/components/BackLink";
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.28),transparent_34%),linear-gradient(180deg,#f3f1ff_0%,#e7e3fb_100%)] px-6 py-10 lg:px-8">
      <div className="mx-auto max-w-[1120px] space-y-8">
        <BackLink />
        <AiAssignmentClient bloomOptions={bloomOptions} student={student} />
      </div>
    </div>
  );
}
