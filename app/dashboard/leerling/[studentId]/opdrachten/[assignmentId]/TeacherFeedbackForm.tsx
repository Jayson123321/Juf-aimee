"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, MessageSquare, Save } from "lucide-react";

export function TeacherFeedbackForm({
  assignmentId,
  existingFeedback,
  studentName,
}: {
  assignmentId: string;
  existingFeedback: string | null;
  studentName: string;
}) {
  const [feedback, setFeedback] = useState(existingFeedback ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function saveFeedback() {
    if (!feedback.trim()) return;
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await fetch("/api/prototype/assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "feedback",
          studentId: "",         // niet nodig voor feedback action
          assignmentId,
          feedback: feedback.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Opslaan mislukt.");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-violet-100 bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-violet-100">
          <MessageSquare className="size-4 text-violet-600" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">Feedback voor {studentName}</h2>
          <p className="text-xs text-gray-500">
            De leerling ziet deze feedback in zijn/haar portaal.
          </p>
        </div>
      </div>

      <textarea
        className="min-h-[160px] w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-7 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100"
        onChange={(e) => {
          setFeedback(e.target.value);
          setSaved(false);
        }}
        placeholder={`Schrijf hier je feedback voor ${studentName}…`}
        value={feedback}
      />

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs text-gray-400">{feedback.length} tekens</div>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={saving || !feedback.trim()}
          onClick={saveFeedback}
          type="button"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Feedback opslaan
        </button>
      </div>

      {saved && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          Feedback opgeslagen — zichtbaar voor {studentName}.
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
    </div>
  );
}
