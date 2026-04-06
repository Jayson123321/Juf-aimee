"use client";

import { LogOut } from "lucide-react";
import { logout } from "./actions";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/components/dashboard/role-context";

export default function LogoutButton() {
  const { sidebarCollapsed } = useDashboard();

  return (
    <form action={logout}>
      <button
        type="submit"
        className={cn(
          "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
          "text-white/55 hover:text-white hover:bg-white/10"
        )}
      >
        <LogOut className="w-4 h-4 shrink-0" />
        {!sidebarCollapsed && <span className="truncate">Uitloggen</span>}
      </button>
    </form>
  );
}
