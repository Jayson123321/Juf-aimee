"use client";

import { ReactNode } from "react";

export default function StudentCardActions({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 flex items-center gap-1 shrink-0">
      {children}
    </div>
  );
}
