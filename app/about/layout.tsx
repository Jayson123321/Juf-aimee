import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DashboardProvider, type UserRole } from "@/components/dashboard/role-context";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import LogoutButton from "@/app/admin/LogoutButton";

/** The About page is reachable by every role — resolve the right shell. */
async function resolveShell() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;
  const studentId = cookieStore.get("session_student_id")?.value;

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const firstStudent = await prisma.student.findFirst({ select: { id: true } });
      return {
        role: (user.role === "ADMIN" ? "ADMIN" : "TEACHER") as UserRole,
        profileHref: firstStudent ? `/student/${firstStudent.id}` : "/students",
        displayName: user.name ?? user.email,
      };
    }
  }

  if (studentId) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (student) {
      return {
        role: "STUDENT" as UserRole,
        profileHref: `/student/${studentId}`,
        displayName: student.fullName,
      };
    }
  }

  redirect("/login");
}

export default async function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, profileHref, displayName } = await resolveShell();

  return (
    <DashboardProvider role={role} profileHref={profileHref}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar footer={<LogoutButton />} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header userName={displayName} />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </DashboardProvider>
  );
}
