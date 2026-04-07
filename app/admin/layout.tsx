import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardProvider } from "@/components/dashboard/role-context";
import { Header } from "@/components/dashboard/Header";
import LogoutButton from "./LogoutButton";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;

  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") redirect("/login");

  return (
    <DashboardProvider role="ADMIN">
      <div className="flex h-screen overflow-hidden">
        <Sidebar footer={<LogoutButton />} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header userName={user.name ?? user.email} />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
