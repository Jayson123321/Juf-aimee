"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronDown, ExternalLink } from "lucide-react";
import { useDashboard } from "./role-context";
import { studentResources } from "@/lib/student-resources";

export function StudentResourcesMenu() {
  const { profileHref, role } = useDashboard();
  const isStudent = role === "STUDENT";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/65 transition hover:bg-white/10 hover:text-white"
      >
        <BookOpen className="size-4" />
        <span>{isStudent ? "Bronnen" : "Leerling bronnen"}</span>
        <ChevronDown
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
        >
          <div className="bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-3">
            <p className="text-sm font-bold text-white">
              {isStudent ? "Handige Bronnen" : "Bronnen voor leerlingen"}
            </p>
            <p className="text-xs text-white/85">
              {isStudent
                ? "Websites die je helpen bij het leren"
                : "Leerzame websites om met leerlingen te delen"}
            </p>
          </div>

          <div className="p-2">
            {studentResources.map((resource) => (
              <a
                key={resource.url}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-violet-50"
              >
                <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                  <ExternalLink className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-800">
                    {resource.name}
                  </span>
                  <span className="block truncate text-xs text-gray-500">
                    {resource.category}
                    {resource.lang === "EN" ? " · Engels" : ""}
                  </span>
                </span>
              </a>
            ))}
          </div>

          <Link
            href={`${profileHref}/bronnen`}
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-violet-600 transition hover:bg-gray-100"
          >
            Alle bronnen bekijken
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
