import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import AddTeacherButton from "./AddTeacherButton";
import EditTeacherButton from "./EditTeacherButton";
import DeleteTeacherButton from "./DeleteTeacherButton";

export default async function TeachersPage() {
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Teachers</h1>
        <AddTeacherButton />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {teachers.map((teacher) => (
          <Card key={teacher.id} className="h-full">
            <CardHeader className="flex flex-row items-center gap-4 border-b pb-4">
              <div className="shrink-0 size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base font-semibold tracking-wide">
                {getInitials(teacher.name ?? teacher.email)}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate">{teacher.name ?? teacher.email}</CardTitle>
                <Badge variant="secondary" className="mt-1">Teacher</Badge>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <EditTeacherButton teacher={teacher} />
                <DeleteTeacherButton id={teacher.id} />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <span className="shrink-0 text-primary/60"><Mail className="size-4" /></span>
                  <span className="truncate">{teacher.email}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
