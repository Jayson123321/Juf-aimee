"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, ReactNode } from "react";

export function Nav({ children }: { children: ReactNode }) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-primary shadow-sm">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-center gap-1 px-6">
        {children}
      </div>
    </nav>
  );
}

export function NavLink(props: Omit<ComponentProps<typeof Link>, "className">) {
  const pathname = usePathname();
  const isActive = pathname === props.href;

  return (
    <Link
      {...props}
      className={cn(
        "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10",
        isActive && "text-primary-foreground bg-white/15 after:absolute after:bottom-[-17px] after:left-0 after:right-0 after:h-0.5 after:bg-primary-foreground after:rounded-full"
      )}
    />
  );
}
