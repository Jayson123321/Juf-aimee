"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BookOpen, CheckCircle2 } from "lucide-react";

export function TabBar({ activeCount, completedCount }: { activeCount: number; completedCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "actief";

  function setTab(value: string) {
    router.push(`${pathname}?tab=${value}`);
  }

  return (
    <div className="grid grid-cols-2 gap-2 rounded-full bg-slate-100 p-1 text-xs font-semibold text-slate-600">
      <button
        onClick={() => setTab("actief")}
        className={`flex items-center justify-center gap-2 rounded-full px-3 py-2 transition ${tab === "actief" ? "bg-white shadow-sm text-slate-900" : "hover:bg-white/60"}`}
      >
        <BookOpen className="size-3.5" />
        Actieve Opdrachten ({activeCount})
      </button>
      <button
        onClick={() => setTab("afgerond")}
        className={`flex items-center justify-center gap-2 rounded-full px-3 py-2 transition ${tab === "afgerond" ? "bg-white shadow-sm text-slate-900" : "hover:bg-white/60"}`}
      >
        <CheckCircle2 className="size-3.5" />
        Afgerond ({completedCount})
      </button>
    </div>
  );
}
