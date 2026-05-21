"use client"
import type { ElementType } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Users, BookOpen,
  GraduationCap, Settings, User, ChevronLeft, ChevronRight, Sparkles, MessageSquare,
} from "lucide-react"
import { useDashboard, UserRole } from "./role-context"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import aimeePortrait from "@/app/Images/Aimee.png"




type NavItem = { href: string; icon: ElementType; label: string }


const adminItems: NavItem[] = [
  { href: "/admin",          icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/students", icon: Users,           label: "Studenten" },
  { href: "/admin/teachers", icon: GraduationCap,   label: "Leraren" },
  { href: "/admin/settings", icon: Settings,        label: "Instellingen" },
]

const roleLabels: Record<UserRole, string> = {
  STUDENT: "Leerling",
  TEACHER: "Leraar",
  ADMIN: "Beheerder",
}

export function Sidebar({ footer }: { footer?: ReactNode }) {
  const { role, sidebarCollapsed, setSidebarCollapsed, profileHref } = useDashboard()
  const pathname = usePathname()

  const studentId = profileHref.split("/").pop()
  const opdrachtenHref = `/student/${studentId}/opdrachten`

  const studentItems: NavItem[] = [
    { href: `/student/${studentId}/profiel`,                           icon: User,     label: "Profiel" },
    { href: opdrachtenHref,                                             icon: BookOpen, label: "Opdrachten" },
    { href: `/student/${studentId}/chat`,                               icon: MessageSquare, label: "Chat" },
    { href: `/student/${studentId}`,                                    icon: Settings, label: "Instellingen" },
  ]

  // "Opdrachten" is intentionally student-only — teachers reach a student's
  // assignments via the "Opdrachten" button on the dashboard student cards.
  const teacherItems: NavItem[] = [
    { href: "/dashboard",                      icon: LayoutDashboard, label: "Dashboard" },
    { href: "/students",                       icon: Users,           label: "Studenten" },
    { href: `/student/${studentId}/generate`,  icon: Sparkles,        label: "Genereer" },
  ]

  const items = role === "STUDENT" ? studentItems : role === "TEACHER" ? teacherItems : adminItems

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full transition-[width] duration-300 ease-in-out shrink-0 border-r border-white/10",
        sidebarCollapsed ? "w-16" : "w-60"
      )}
      style={{ backgroundColor: "oklch(0.18 0.07 255)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-12 h-14 rounded-lg overflow-hidden shrink-0">
          <Image src={aimeePortrait} alt="Juf Aimée" width={60} height={70} className="object-cover w-full h-full" />
        </div>
        {!sidebarCollapsed && (
          <p className="text-white font-semibold text-sm leading-tight overflow-hidden">Juf Aimée</p>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {items.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== "/dashboard" && href !== "/admin" && !href.match(/\/student\/[^/]+$/) && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              title={sidebarCollapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                "text-white/55 hover:text-white hover:bg-white/10",
                isActive && "bg-white/15 text-white border-l-2 border-white/60 pl-[10px]"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer slot (e.g. logout) */}
      {footer && (
        <div className="px-2 border-t border-white/10 pt-1">
          {footer}
        </div>
      )}

      {/* Collapse toggle */}
      <div className="px-2 py-3 border-t border-white/10">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex items-center justify-center w-full h-8 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all duration-150 cursor-pointer"
          aria-label={sidebarCollapsed ? "Zijbalk uitklappen" : "Zijbalk inklappen"}
        >
          {sidebarCollapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft className="w-4 h-4" />
          }
        </button>
      </div>
     </aside>
   )
  }
 


