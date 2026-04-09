import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DashboardProvider } from "@/components/dashboard/role-context";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import LogoutButton from "@/app/admin/LogoutButton";

export default async function StudentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const studentId = cookieStore.get("session_student_id")?.value;
  const userId = cookieStore.get("session_user_id")?.value;

  // Allow access for logged-in teachers/admins viewing a student profile
  const isTeacher = !!userId && !!(await prisma.user.findUnique({ where: { id: userId } }));

  if (!isTeacher && !studentId) redirect("/login");

  const student = await prisma.student.findUnique({ where: { id: isTeacher ? id : studentId! } });
  if (!student) redirect("/login");

  const role = isTeacher ? "TEACHER" : "STUDENT";

  return (
    <DashboardProvider role={role} profileHref={`/student/${id}`}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar footer={<LogoutButton />} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header userName={student.fullName} />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
