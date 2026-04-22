"use client"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDashboard, UserRole } from "./role-context"

const roleLabels: Record<UserRole, string> = {
  STUDENT: "Leerling",
  TEACHER: "Leraar",
  ADMIN: "Beheerder",
}

export function Header({ userName }: { userName?: string }) {
  const { role } = useDashboard()

  const displayName = userName ?? "Gebruiker"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="h-20 flex items-center justify-between px-6 border-b border-white/10 shrink-0" style={{ backgroundColor: "oklch(0.18 0.07 255)" }}>
      {/* Left */}
      <p className="text-xl font-large text-white/60"></p>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-10 w-10 text-white/60 hover:text-white hover:bg-white/10" aria-label="Meldingen">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full" />
        </Button>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
            style={{ backgroundColor: "oklch(0.28 0.09 255)" }}
          >
            {initials}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-xs font-semibold text-white">{displayName}</p>
            <p className="text-[10px] text-white/50">{roleLabels[role]}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
