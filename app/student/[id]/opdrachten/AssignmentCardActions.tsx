"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Send } from "lucide-react";

export function AssignmentCardActions({
  assignmentId,
  studentId,
  hasWork,
}: {
  assignmentId: string;
  studentId: string;
  hasWork: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/prototype/student-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          studentId,
          assignmentId,
          work: "",          // werk is al opgeslagen via de detail pagina
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Inleveren mislukt.");
      setDone(true);
      setTimeout(() => router.refresh(), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inleveren mislukt.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-700">
        <CheckCircle2 className="size-4" />
        Ingeleverd!
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <button
        type="button"
        disabled={submitting || !hasWork}
        onClick={handleSubmit}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-50 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        {submitting ? "Bezig met inleveren…" : "Inleveren"}
      </button>
      {!hasWork && (
        <p className="text-center text-xs text-slate-400">
          Sla eerst je werk op via de opdracht voordat je kunt inleveren.
        </p>
      )}
      {error && (
        <p className="text-center text-xs text-rose-600">{error}</p>
      )}
    </div>
  );
}
