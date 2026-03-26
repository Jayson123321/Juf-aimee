import { prisma } from "@/lib/db";


export default async function DashboardPage() {
  const students = await prisma.student.findMany({
    include: {
    }, 
    orderBy: {
      fullName: 'asc',
    },
  })

  return (
    <main className="min-h-screen bg-slate-100 px-7 py-4">
      <div className="mx-auto max-w-[1920px]">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      </div>
    </main>
  )
}
  
  
