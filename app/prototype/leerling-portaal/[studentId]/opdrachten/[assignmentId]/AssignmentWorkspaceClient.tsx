"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Save, Send } from "lucide-react";

export function AssignmentWorkspaceClient({
  assignmentId,
  initialWork,
  isCompleted,
  studentId,
}: {
  assignmentId: string;
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

  useEffect(() => {
    fetch("/api/prototype/student-assignment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "tips",
        studentId,
        assignmentId,
      }),
    })
      .then((response) => response.json())
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
        body: JSON.stringify({
          action: "save",
          studentId,
          assignmentId,
          work,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Opslaan mislukt.");
      setMessage("Je werk is opgeslagen.");
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
        body: JSON.stringify({
          action: "submit",
          studentId,
          assignmentId,
          work,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Inleveren mislukt.");
      setCompleted(true);
      setMessage("Je opdracht is ingeleverd. Goed gedaan!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inleveren mislukt.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="rounded-[24px] border border-white/80 bg-white/95 p-5 shadow-[0_16px_40px_rgba(106,124,167,0.08)]">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-lg">✏️</span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Jouw Werk</h2>
            <p className="mt-1 text-sm text-slate-500">
              Schrijf hier je antwoord. Neem de tijd en doe je best!
            </p>
          </div>
        </div>

        <textarea
          className="min-h-[260px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400"
          disabled={completed}
          onChange={(event) => setWork(event.target.value)}
          placeholder="Begin hier met schrijven..."
          value={work}
        />

        <p className="mt-3 text-xs text-slate-400">{work.length} karakters geschreven</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving || submitting || completed}
            onClick={saveWork}
            type="button"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Opslaan
          </button>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-500 to-slate-700 text-sm font-semibold text-white transition hover:from-slate-600 hover:to-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving || submitting || completed}
            onClick={submitWork}
            type="button"
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Inleveren
          </button>
        </div>

        {message ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-700">
          Let op: Vergeet niet regelmatig op te slaan. Je kunt later terugkomen om verder te werken.
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#faf7ff_0%,#f4f7ff_100%)] p-5 shadow-[0_16px_40px_rgba(106,124,167,0.08)]">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-lg">💭</span>
          <h2 className="text-sm font-semibold text-slate-900">Denktips</h2>
        </div>

        {loadingTips ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" />
            Denktips laden...
          </div>
        ) : (
          <ul className="space-y-3 text-sm leading-7 text-slate-700">
            {tips.map((tip) => (
              <li className="flex items-start gap-3" key={tip}>
                <Check className="mt-1 size-4 shrink-0 text-slate-500" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
