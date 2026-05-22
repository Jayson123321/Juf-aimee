"use client";

import { useEffect, useRef, useState } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  BookOpen,
  ChevronDown,
  Compass,
  Library,
  Sparkles,
  Target,
} from "lucide-react";

type ResourceItem = {
  href: string;
  icon: ElementType;
  title: string;
  desc: string;
  chip: string;
};

const items: ResourceItem[] = [
  {
    href: "/dashboard/bronnen#perfecte-opdracht",
    icon: Target,
    title: "De perfecte opdracht maken",
    desc: "Stap voor stap naar een sterke opdracht",
    chip: "bg-orange-100 text-orange-600",
  },
  {
    href: "/dashboard/bronnen#genereren",
    icon: Sparkles,
    title: "Tips bij AI-opdrachten",
    desc: "Waar je op let bij het genereren",
    chip: "bg-violet-100 text-violet-600",
  },
  {
    href: "/dashboard/bronnen#bloom",
    icon: Brain,
    title: "Bloom-niveaus uitgelegd",
    desc: "Daag uit op het juiste niveau",
    chip: "bg-emerald-100 text-emerald-600",
  },
  {
    href: "/dashboard/bronnen#lesmateriaal",
    icon: Library,
    title: "Lesmateriaal & bronnen",
    desc: "Bibliotheek met materiaal (RAG)",
    chip: "bg-sky-100 text-sky-600",
  },
  {
    href: "/dashboard/bronnen#leerling-bronnen",
    icon: Compass,
    title: "Bronnen voor leerlingen",
    desc: "Leerzame websites voor je leerlingen",
    chip: "bg-emerald-100 text-emerald-600",
  },
];

export function ResourcesMenu() {
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
        <span>Bronnen &amp; Help</span>
        <ChevronDown
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
        >
          <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-3">
            <p className="text-sm font-bold text-white">Bronnen &amp; Help</p>
            <p className="text-xs text-white/85">
              Tips voor sterke opdrachten op maat
            </p>
          </div>

          <div className="p-2">
            {items.map(({ href, icon: Icon, title, desc, chip }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-orange-50"
              >
                <span
                  className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg ${chip}`}
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-800">
                    {title}
                  </span>
                  <span className="block text-xs text-gray-500">{desc}</span>
                </span>
              </Link>
            ))}
          </div>

          <Link
            href="/dashboard/bronnen"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-orange-600 transition hover:bg-gray-100"
          >
            Alle bronnen bekijken
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
