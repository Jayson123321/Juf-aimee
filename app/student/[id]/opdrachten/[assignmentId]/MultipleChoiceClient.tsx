"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, HelpCircle, Lightbulb, Loader2, Sparkles, XCircle } from "lucide-react";
import { StudentChatClient } from "../../chat/StudentChatClient";

export type McContent = {
  question: string;
  options: string[];
  correctIndex: number;
  hints: string[];
  explanation: string;
};

export function MultipleChoiceClient({
  assignmentId,
  assignmentTitle,
  assignmentTip,
  bloomLevel,
  firstName,
  mc,
  isCompleted,
  studentId,
  initialWork,
}: {
  assignmentId: string;
  assignmentTitle: string;
  assignmentTip?: string | null;
  bloomLevel: string;
  firstName: string;
  mc: McContent;
  isCompleted: boolean;
  studentId: string;
  initialWork: string;
}) {
  const initialSelected = (() => {
    const parsed = Number.parseInt(initialWork, 10);
    return Number.isFinite(parsed) && parsed >= 0 && parsed < mc.options.length ? parsed : null;
  })();

  const [selected, setSelected] = useState<number | null>(initialSelected);
  const [submitted, setSubmitted] = useState(isCompleted);
  const [shake, setShake] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isCorrect = submitted && selected === mc.correctIndex;
  const draftWork = useMemo(() => {
    if (selected === null) return "";
    const letter = String.fromCharCode(65 + selected);
    return `De leerling denkt nu aan antwoord ${letter}: ${mc.options[selected]}`;
  }, [mc.options, selected]);

  function handlePick(idx: number) {
    if (submitted) return;
    setSelected(idx);
    setError("");
  }

  function showNextHint() {
    setHintsUsed((n) => Math.min(n + 1, mc.hints.length));
  }

  async function submitAnswer() {
    if (selected === null) return;
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
          work: String(selected),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Inleveren mislukt.");

      if (selected !== mc.correctIndex) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inleveren mislukt.");
    } finally {
      setSubmitting(false);
    }
  }

  function tryAgain() {
    setSubmitted(false);
    setSelected(null);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <div
          className={`overflow-hidden rounded-3xl border bg-white shadow-[0_12px_36px_rgba(92,114,180,0.08)] transition ${
            shake ? "animate-[shake_0.4s_ease-in-out]" : ""
          } ${isCorrect ? "border-emerald-300" : submitted ? "border-rose-200" : "border-slate-200/80"}`}
        >
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
            <span className="text-xl">❓</span>
            <div>
              <h2 className="font-semibold text-slate-950">Kies het juiste antwoord</h2>
              <p className="text-xs text-slate-500">Klik op het antwoord dat volgens jou klopt.</p>
            </div>
          </div>

          <div className="px-6 py-5">
            <p className="mb-5 text-[1.08rem] leading-8 text-slate-900">{mc.question}</p>

            <div className="space-y-3">
              {mc.options.map((option, idx) => {
                const isPicked = selected === idx;
                const isCorrectOption = idx === mc.correctIndex;
                const showAsCorrect = submitted && isCorrectOption;
                const showAsWrong = submitted && isPicked && !isCorrectOption;

                return (
                  <button
                    className={`flex w-full items-start gap-3 rounded-2xl border-2 px-5 py-4 text-left transition ${
                      showAsCorrect
                        ? "border-emerald-400 bg-emerald-50"
                        : showAsWrong
                          ? "border-rose-400 bg-rose-50"
                          : isPicked
                            ? "border-violet-400 bg-violet-50"
                            : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40"
                    } ${submitted ? "cursor-default" : "cursor-pointer"}`}
                    disabled={submitting}
                    key={idx}
                    onClick={() => handlePick(idx)}
                    type="button"
                  >
                    <span
                      className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        showAsCorrect
                          ? "bg-emerald-500 text-white"
                          : showAsWrong
                            ? "bg-rose-500 text-white"
                            : isPicked
                              ? "bg-violet-500 text-white"
                              : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 text-[1.02rem] leading-7 text-slate-800">{option}</span>
                    {showAsCorrect && <CheckCircle2 className="mt-1 size-5 shrink-0 text-emerald-500" />}
                    {showAsWrong && <XCircle className="mt-1 size-5 shrink-0 text-rose-500" />}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {submitted ? (
              <div className="mt-6 space-y-4">
                {isCorrect ? (
                  <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 px-5 py-4">
                    <Sparkles className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">
                        Top {firstName}, dat klopt! 🎉
                      </p>
                      <p className="mt-1 text-sm leading-7 text-emerald-800">{mc.explanation}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
                      <XCircle className="mt-0.5 size-5 shrink-0 text-rose-600" />
                      <div>
                        <p className="text-sm font-semibold text-rose-900">Bijna! Probeer het nog eens.</p>
                        <p className="mt-1 text-sm leading-7 text-rose-800">
                          Het juiste antwoord was <strong>{String.fromCharCode(65 + mc.correctIndex)}</strong>.
                        </p>
                        <p className="mt-1 text-sm leading-7 text-rose-800">{mc.explanation}</p>
                      </div>
                    </div>
                    <button
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      onClick={tryAgain}
                      type="button"
                    >
                      Opnieuw proberen
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(98,101,255,0.22)] transition hover:from-violet-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={selected === null || submitting}
                onClick={submitAnswer}
                type="button"
              >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                Antwoord controleren
              </button>
            )}
          </div>
        </div>

        {!submitted && mc.hints.length > 0 && (
          <div className="overflow-hidden rounded-3xl border border-violet-100 bg-[linear-gradient(180deg,#faf8ff_0%,#f3f0ff_100%)] shadow-[0_12px_36px_rgba(92,114,180,0.06)]">
            <div className="flex items-center gap-3 border-b border-violet-100 px-6 py-4">
              <div className="flex size-8 items-center justify-center rounded-xl bg-violet-100">
                <HelpCircle className="size-4 text-violet-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-950">Vastgelopen?</h2>
                <p className="text-xs text-slate-500">Klik voor een hint - probeer eerst zelf nog even.</p>
              </div>
            </div>
            <div className="px-6 py-5">
              {hintsUsed === 0 ? (
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-white px-5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
                  onClick={showNextHint}
                  type="button"
                >
                  <Lightbulb className="size-4" />
                  Geef me een hint
                </button>
              ) : (
                <div className="space-y-3">
                  {mc.hints.slice(0, hintsUsed).map((hint, i) => (
                    <div
                      className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_2px_8px_rgba(98,101,255,0.06)] ring-1 ring-violet-100"
                      key={i}
                    >
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">
                        {i + 1}
                      </div>
                      <span className="text-sm leading-7 text-slate-700">{hint}</span>
                    </div>
                  ))}
                  {hintsUsed < mc.hints.length && (
                    <button
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-white px-4 text-xs font-semibold text-violet-700 transition hover:bg-violet-50"
                      onClick={showNextHint}
                      type="button"
                    >
                      <Lightbulb className="size-3" />
                      Nog een hint
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <aside className="xl:sticky xl:top-6 xl:self-start">
        <StudentChatClient
          assignmentId={assignmentId}
          assignmentQuestion={mc.question}
          assignmentTip={assignmentTip ?? null}
          assignmentTitle={assignmentTitle}
          assignmentType="MULTIPLE_CHOICE"
          compact
          draftWork={draftWork}
          studentId={studentId}
          studentName={firstName}
        />
      </aside>
    </div>
  );
}
