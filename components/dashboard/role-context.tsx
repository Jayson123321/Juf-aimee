"use client"
import { createContext, useContext, useState, ReactNode } from "react"

export type UserRole = "STUDENT" | "TEACHER" | "ADMIN"

interface DashboardContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
  profileHref: string
}

const DashboardContext = createContext<DashboardContextType>({
  role: "TEACHER",
  setRole: () => {},
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  profileHref: "/students",
})

export function DashboardProvider({
  children,
  role: initialRole = "TEACHER",
  profileHref = "/students",
}: {
  children: ReactNode
  role?: UserRole
  profileHref?: string
}) {
  const [role, setRole] = useState<UserRole>(initialRole)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  return (
    <DashboardContext.Provider value={{ role, setRole, sidebarCollapsed, setSidebarCollapsed, profileHref }}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => useContext(DashboardContext)
