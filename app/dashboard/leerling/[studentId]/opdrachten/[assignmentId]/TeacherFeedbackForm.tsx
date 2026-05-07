"use client";

import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, Loader2, MessageSquare, Save, Sparkles } from "lucide-react";

export function TeacherFeedbackForm({
  studentId,
  assignmentId,
  existingFeedback,
  studentName,
  imageSubmissionId,
}: {
  studentId: string;
  assignmentId: string;
  existingFeedback: string | null;
  studentName: string;
  imageSubmissionId?: string | null;
}) {
  const [feedback, setFeedback] = useState(existingFeedback ?? "");
  const [preview, setPreview] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function analyzeDrawing() {
    setAnalyzing(true);
    setAnalyzeError("");
    try {
      const response = await fetch("/api/analyze-drawing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: imageSubmissionId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Analyse mislukt.");
      setFeedback(data.analysis);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Analyse mislukt.");
    } finally {
      setAnalyzing(false);
    }
  }

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
          studentId,
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

      {/* AI analyse knop */}
      {imageSubmissionId && !existingFeedback && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3">
          <Sparkles className="size-4 shrink-0 text-violet-500" />
          <p className="flex-1 text-xs leading-6 text-violet-700">
            Er is een tekening ingestuurd. Laat AI de tekening analyseren als startpunt voor je feedback.
          </p>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={analyzing}
            onClick={analyzeDrawing}
            type="button"
          >
            {analyzing ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
            {analyzing ? "Analyseren…" : "Analyseer tekening"}
          </button>
        </div>
      )}

      {analyzeError && (
        <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          {analyzeError}
        </p>
      )}

      {/* Toggle edit / preview */}
      {feedback && (
        <div className="mb-2 flex justify-end">
          <button
            className="inline-flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800"
            onClick={() => setPreview((v) => !v)}
            type="button"
          >
            {preview ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            {preview ? "Bewerken" : "Voorbeeld"}
          </button>
        </div>
      )}

      {preview ? (
        <div className="min-h-[160px] w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
          {feedback.split("\n\n").map((block, i) => {
            const lines = block.split("\n");
            const isList = lines.every((l) => l.startsWith("- ") || l === "");
            if (isList) {
              return (
                <ul key={i} className="mb-4 list-disc pl-5 space-y-1 last:mb-0">
                  {lines.filter((l) => l.startsWith("- ")).map((l, j) => (
                    <li key={j}>{l.slice(2)}</li>
                  ))}
                </ul>
              );
            }
            // Eerste regel is een header als de rest een lijst is of als de regel eindigt op ":"
            const [first, ...rest] = lines;
            if (first.endsWith(":") && rest.length === 0) {
              return <p key={i} className="mb-1 font-semibold text-gray-900">{first}</p>;
            }
            if (first.endsWith(":") && rest.length > 0) {
              return (
                <div key={i} className="mb-4 last:mb-0">
                  <p className="mb-1 font-semibold text-gray-900">{first}</p>
                  {rest.every((l) => l.startsWith("- ")) ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {rest.map((l, j) => <li key={j}>{l.slice(2)}</li>)}
                    </ul>
                  ) : (
                    <p className="leading-7">{rest.join(" ")}</p>
                  )}
                </div>
              );
            }
            return <p key={i} className="mb-4 leading-7 last:mb-0">{block}</p>;
          })}
        </div>
      ) : (
        <textarea
          className="min-h-[160px] w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-7 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100"
          onChange={(e) => { setFeedback(e.target.value); setSaved(false); }}
          placeholder={`Schrijf hier je feedback voor ${studentName}…`}
          value={feedback}
        />
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs text-gray-400">{feedback.length} tekens</div>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={saving || !feedback.trim()}
          onClick={saveFeedback}
          type="button"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
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
