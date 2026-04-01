import { prisma } from "@/lib/db"
import { DashboardProvider } from "@/components/dashboard/role-context"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { Header } from "@/components/dashboard/Header"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // TODO: replace with the logged-in student's ID once auth is in place
  const firstStudent = await prisma.student.findFirst({ select: { id: true } })
  const profileHref = firstStudent ? `/student/${firstStudent.id}` : "/students"

  return (
    <DashboardProvider profileHref={profileHref}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  )
}
