"use client";

import { useEffect, useRef, useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  ClipboardCheck,
  MessageSquare,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useDashboard } from "./role-context";

type Note = {
  icon: ElementType;
  chip: string;
  message: string;
  time: string;
  read: boolean;
};

// Demo notifications — sample data to showcase the feature.
const STUDENT_NOTES: Note[] = [
  {
    icon: Sparkles,
    chip: "bg-violet-100 text-violet-600",
    message: "Jouw docent heeft een nieuwe opdracht voor jou gemaakt.",
    time: "10 minuten geleden",
    read: false,
  },
  {
    icon: MessageSquare,
    chip: "bg-emerald-100 text-emerald-600",
    message: "Je hebt feedback gekregen op 'De waterkringloop'.",
    time: "2 uur geleden",
    read: false,
  },
  {
    icon: BookOpen,
    chip: "bg-sky-100 text-sky-600",
    message: "Er zijn nieuwe bronnen toegevoegd die je kunnen helpen.",
    time: "Gisteren",
    read: true,
  },
];

const TEACHER_NOTES: Note[] = [
  {
    icon: ClipboardCheck,
    chip: "bg-emerald-100 text-emerald-600",
    message: "Daan heeft de opdracht 'Bruggen bouwen' ingeleverd.",
    time: "25 minuten geleden",
    read: false,
  },
  {
    icon: AlertTriangle,
    chip: "bg-amber-100 text-amber-600",
    message: "Een opdracht van Julia loopt al meer dan 7 dagen.",
    time: "3 uur geleden",
    read: false,
  },
  {
    icon: UserPlus,
    chip: "bg-sky-100 text-sky-600",
    message: "Een nieuwe leerling is toegevoegd aan je groep.",
    time: "Gisteren",
    read: true,
  },
];

export function NotificationsMenu() {
  const { role } = useDashboard();
  const isStudent = role === "STUDENT";
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>(
    isStudent ? STUDENT_NOTES : TEACHER_NOTES,
  );
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

  const unread = notes.filter((n) => !n.read).length;
  const grad = isStudent
    ? "from-violet-600 to-blue-500"
    : "from-orange-500 to-amber-400";
  const soft = isStudent ? "bg-violet-50" : "bg-orange-50";
  const dot = isStudent ? "bg-violet-500" : "bg-orange-500";

  function markAllRead() {
    setNotes((prev) => prev.map((n) => ({ ...n, read: true })));
  }
  function markRead(index: number) {
    setNotes((prev) =>
      prev.map((n, i) => (i === index ? { ...n, read: true } : n)),
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Meldingen"
        className="relative flex size-10 items-center justify-center rounded-lg text-white/65 transition hover:bg-white/10 hover:text-white"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4 text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
        >
          <div
            className={`flex items-center justify-between bg-gradient-to-r ${grad} px-4 py-3`}
          >
            <div>
              <p className="text-sm font-bold text-white">Meldingen</p>
              <p className="text-xs text-white/85">
                {unread > 0 ? `${unread} ongelezen` : "Alles gelezen"}
              </p>
            </div>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-white/30"
              >
                Markeer als gelezen
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-auto p-2">
            {notes.map((note, i) => {
              const Icon = note.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => markRead(i)}
                  className={`flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition hover:bg-gray-50 ${
                    note.read ? "" : soft
                  }`}
                >
                  <span
                    className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg ${note.chip}`}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm leading-5 ${
                        note.read
                          ? "text-gray-500"
                          : "font-semibold text-gray-800"
                      }`}
                    >
                      {note.message}
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-400">
                      {note.time}
                    </span>
                  </span>
                  {!note.read && (
                    <span
                      className={`mt-1 size-2 shrink-0 rounded-full ${dot}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
