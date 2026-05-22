"use client"
import { useDashboard, UserRole } from "./role-context"
import { ResourcesMenu } from "./ResourcesMenu"
import { StudentResourcesMenu } from "./StudentResourcesMenu"
import { NotificationsMenu } from "./NotificationsMenu"

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
    <header className="relative z-10 h-14 flex items-center justify-between px-6 shrink-0" style={{ backgroundColor: "oklch(0.18 0.07 255)" }}>
      {/* Left */}
      {role === "TEACHER" || role === "ADMIN" ? (
        <div className="flex items-center gap-1">
          <ResourcesMenu />
          <StudentResourcesMenu />
        </div>
      ) : (
        <StudentResourcesMenu />
      )}

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <NotificationsMenu />

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

      {/* Wavy edge — lets the header flow into the page body instead of a hard line */}
      <svg
        aria-hidden
        className="pointer-events-none absolute left-0 top-full h-7 w-full"
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        style={{
          fill: "oklch(0.18 0.07 255)",
          filter: "drop-shadow(0 6px 7px rgba(0,0,0,0.12))",
        }}
      >
        <path d="M0,0 H1440 V18 C1190,46 1030,4 720,22 C430,39 250,6 0,24 Z" />
      </svg>
    </header>
  )
}
