import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DashboardProvider } from "@/components/dashboard/role-context"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { Header } from "@/components/dashboard/Header"
import LogoutButton from "@/app/admin/LogoutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;

  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  const firstStudent = await prisma.student.findFirst({ select: { id: true } })
  const profileHref = firstStudent ? `/student/${firstStudent.id}` : "/students"

  return (
    <DashboardProvider profileHref={profileHref}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar footer={<LogoutButton />} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header userName={user.name ?? user.email} />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  )
}
