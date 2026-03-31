"use client"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDashboard, UserRole } from "./role-context"

const roleLabels: Record<UserRole, string> = {
  STUDENT: "Student",
  TEACHER: "Leraar",
  ADMIN: "Beheerder",
}

const mockUsers: Record<UserRole, string> = {
  STUDENT: "Emma de Vries",
  TEACHER: "Aimée Bakker",
  ADMIN: "Systeembeheerder",
}

export function Header() {
  const { role, setRole } = useDashboard()
  const initials = mockUsers[role]
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card/60 backdrop-blur-sm shrink-0">
      {/* Left */}
      <p className="text-sm font-medium text-muted-foreground">Dashboard</p>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Role switcher — demo only, replace with real auth */}
        <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5 text-xs">
          {(["STUDENT", "TEACHER", "ADMIN"] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all duration-150 cursor-pointer ${
                role === r
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {roleLabels[r]}
            </button>
          ))}
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8" aria-label="Meldingen">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full" />
        </Button>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-primary-foreground shrink-0"
            style={{ backgroundColor: "oklch(0.28 0.09 255)" }}
          >
            {initials}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-xs font-semibold text-foreground">{mockUsers[role]}</p>
            <p className="text-[10px] text-muted-foreground">{roleLabels[role]}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
