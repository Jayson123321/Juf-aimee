import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssignmentStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const statusLabel: Record<AssignmentStatus, string> = {
  PENDING: "Te doen",
  IN_PROGRESS: "Bezig",
  COMPLETED: "Afgerond",
};

const statusVariant: Record<
  AssignmentStatus,
  "default" | "secondary" | "outline"
> = {
  PENDING: "outline",
  IN_PROGRESS: "secondary",
  COMPLETED: "default",
};

export default async function AssignmentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    select: { fullName: true },
  });
  if (!student) notFound();

  const assignments = await prisma.assignment.findMany({
    where: { studentId: id },
    include: { subject: true },
    orderBy: [{ subject: { name: "asc" } }, { dueDate: "asc" }],
  });

  // Group by subject
  const bySubject = assignments.reduce<
    Record<string, { subjectName: string; items: typeof assignments }>
  >((acc, a) => {
    const key = a.subjectId ?? "zonder-vak";
    if (!acc[key]) {
      acc[key] = { subjectName: a.subject?.name ?? "Zonder vak", items: [] };
    }
    acc[key].items.push(a);
    return acc;
  }, {});

  const groups = Object.values(bySubject);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Opdrachten</h1>
        <span className="text-sm text-muted-foreground">
          {assignments.length} opdracht{assignments.length !== 1 ? "en" : ""}
        </span>
      </div>

      {groups.length === 0 ? (
        <p className="text-muted-foreground">Nog geen opdrachten toegewezen.</p>
      ) : (
        groups.map((group) => (
          <div key={group.subjectName} className="space-y-3">
            <h2 className="text-lg font-semibold">{group.subjectName}</h2>
            <div className="space-y-2">
              {group.items.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle>{assignment.title}</CardTitle>
                        {assignment.description && (
                          <CardDescription>
                            {assignment.description}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant={statusVariant[assignment.status]}>
                        {statusLabel[assignment.status]}
                      </Badge>
                    </div>
                  </CardHeader>
                  {(assignment.dueDate || assignment.bloomLevel) && (
                    <CardContent>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {assignment.dueDate && (
                          <span>
                            Inleveren:{" "}
                            {new Date(assignment.dueDate).toLocaleDateString(
                              "nl-NL"
                            )}
                          </span>
                        )}
                        {assignment.bloomLevel && (
                          <span>Bloom: {assignment.bloomLevel}</span>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
