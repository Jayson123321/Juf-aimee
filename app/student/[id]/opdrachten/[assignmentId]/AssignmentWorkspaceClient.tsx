"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Lightbulb,
  Loader2,
  Save,
  Send,
  Sparkles,
} from "lucide-react";

export function AssignmentWorkspaceClient({
  assignmentId,
  firstName,
  initialWork,
  isCompleted,
  studentId,
}: {
  assignmentId: string;
  firstName: string;
  initialWork: string;
  isCompleted: boolean;
  studentId: string;
}) {
  const [work, setWork] = useState(initialWork);
  const [tips, setTips] = useState<string[]>([]);
  const [loadingTips, setLoadingTips] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(isCompleted);
  const [savedOnce, setSavedOnce] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = work.trim() === "" ? 0 : work.trim().split(/\s+/).length;
  const charCount = work.length;

  useEffect(() => {
    fetch("/api/prototype/student-assignment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "tips", studentId, assignmentId }),
    })
      .then((r) => r.json())
      .then((data) => {
        setTips(data.tips ?? []);
        setLoadingTips(false);
      })
      .catch(() => {
        setTips([
          "Lees de opdracht goed door voordat je begint.",
          "Denk na over wat je al weet over dit onderwerp.",
          "Leg uit waarom je iets denkt en geef voorbeelden.",
          "Controleer je werk voordat je het inlevert.",
        ]);
        setLoadingTips(false);
      });
  }, [assignmentId, studentId]);

  async function saveWork() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/prototype/student-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", studentId, assignmentId, work }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Opslaan mislukt.");
      setSavedOnce(true);
      setMessage("Opgeslagen!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  }

  async function submitWork() {
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/prototype/student-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", studentId, assignmentId, work }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Inleveren mislukt.");
      setCompleted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inleveren mislukt.");
    } finally {
      setSubmitting(false);
    }
  }

  if (completed) {
    return (
      <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-[0_12px_36px_rgba(92,114,180,0.08)]">
        <div className="flex flex-col items-center gap-4 px-7 py-10 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-950">Goed gedaan, {firstName}! 🎉</h3>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Je hebt je opdracht ingeleverd. Je leraar bekijkt het binnenkort.
            </p>
          </div>
          {work && (
            <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-left">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Jouw antwoord</p>
              <p className="text-sm leading-7 text-slate-700 whitespace-pre-wrap">{work}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Write area */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_36px_rgba(92,114,180,0.08)]">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
          <span className="text-xl">✏️</span>
          <div>
            <h2 className="font-semibold text-slate-950">Jouw antwoord</h2>
            <p className="text-xs text-slate-500">Schrijf hier je werk. Neem de tijd en doe je best!</p>
          </div>
        </div>

        <div className="px-6 py-5">
          <textarea
            ref={textareaRef}
            className="min-h-[280px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-[1.02rem] leading-8 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100"
            onChange={(e) => setWork(e.target.value)}
            placeholder={`Hé ${firstName}, begin hier met schrijven…`}
            value={work}
          />

          {/* Stats row */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>{wordCount} woorden · {charCount} tekens</span>
            {savedOnce && !saving && (
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="size-3" />
                Opgeslagen
              </span>
            )}
          </div>

          {/* Feedback messages */}
          {message && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              {message}
            </div>
          )}
          {error && (
            <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving || submitting}
              onClick={saveWork}
              type="button"
            >
              <span>{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}</span>
              Opslaan
            </button>
            <button
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(98,101,255,0.22)] transition hover:from-violet-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving || submitting || work.trim().length < 5}
              onClick={submitWork}
              type="button"
            >
              <span>{submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}</span>
              Inleveren
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-slate-400">
            Tip: sla je werk op terwijl je bezig bent, zodat je niets kwijtraakt.
          </p>
        </div>
      </div>

      {/* Think tips */}
      <div className="overflow-hidden rounded-3xl border border-violet-100 bg-[linear-gradient(180deg,#faf8ff_0%,#f3f0ff_100%)] shadow-[0_12px_36px_rgba(92,114,180,0.06)]">
        <div className="flex items-center gap-3 border-b border-violet-100 px-6 py-4">
          <div className="flex size-8 items-center justify-center rounded-xl bg-violet-100">
            <Sparkles className="size-4 text-violet-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-950">Denktips</h2>
            <p className="text-xs text-slate-500">Gebruik deze tips als je even vastzit</p>
          </div>
        </div>

        <div className="px-6 py-5">
          {loadingTips ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" />
              Denktips laden…
            </div>
          ) : (
            <ul className="space-y-3">
              {tips.map((tip, i) => (
                <li
                  className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_2px_8px_rgba(98,101,255,0.06)] ring-1 ring-violet-100"
                  key={i}
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">
                    {i + 1}
                  </div>
                  <span className="text-sm leading-7 text-slate-700">{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mx-6 mb-6 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <p className="text-xs leading-6 text-amber-700">
            Je mag altijd vragen stellen aan je leraar als je iets niet begrijpt.
          </p>
        </div>
      </div>
    </div>
  );
}
