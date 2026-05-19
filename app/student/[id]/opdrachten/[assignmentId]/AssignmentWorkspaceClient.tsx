"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  FileText,
  Lightbulb,
  Loader2,
  MessageSquare,
  Paperclip,
  Save,
  Send,
  Sparkles,
  ThumbsUp,
  Trash2,
  Upload,
} from "lucide-react";
import { StudentChatClient } from "../../chat/StudentChatClient";
import aimeePortrait from "@/app/Images/Aimee.png";

type AnswerAnalysis = {
  verdict: string;
  verdictMessage: string;
  strengths: string[];
  tips: string[];
};

function verdictTone(verdict: string): { label: string; bg: string; text: string; ring: string; emoji: string } {
  const v = verdict.toLowerCase();
  if (v.includes("sterk")) return { label: "Sterk", bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200", emoji: "🌟" };
  if (v.includes("kan beter")) return { label: "Kan beter", bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-200", emoji: "💪" };
  return { label: "Op weg", bg: "bg-sky-100", text: "text-sky-700", ring: "ring-sky-200", emoji: "🚀" };
}

function AimeeAnalysisCard({
  analyzing,
  analysis,
  error,
}: {
  analyzing: boolean;
  analysis: AnswerAnalysis | null;
  error: string;
}) {
  const tone = analysis ? verdictTone(analysis.verdict) : null;

  return (
    <div className="relative pt-14">
      {/* Aimee portrait peeking above the cloud */}
      <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
        <div className="relative size-24 overflow-hidden rounded-full bg-white shadow-[0_8px_24px_rgba(92,114,180,0.18)] ring-4 ring-white">
          <Image
            alt="Juf Aimee"
            className="object-cover object-[center_20%]"
            fill
            src={aimeePortrait}
          />
        </div>
      </div>

      <div className="relative">
        {/* Bumpy cloud top */}
        <svg
          aria-hidden
          className="absolute inset-x-0 -top-4 z-10 h-10 w-full text-white drop-shadow-[0_-4px_8px_rgba(125,140,200,0.10)]"
          preserveAspectRatio="none"
          viewBox="0 0 400 40"
        >
          <path
            d="M 0,40 L 0,30 C 16,28 26,16 44,18 C 56,4 86,2 102,16 C 116,4 142,2 158,18 C 174,4 204,4 220,20 C 236,6 268,8 282,22 C 298,10 326,12 342,24 C 356,16 384,20 400,30 L 400,40 Z"
            fill="currentColor"
          />
        </svg>

        {/* Cloud body */}
        <div className="relative overflow-hidden rounded-[28px] rounded-t-[12px] bg-white pb-6 pt-10 shadow-[0_12px_36px_rgba(92,114,180,0.14)]">
          {/* Soft gradient inside */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(240,247,255,1)_60%,rgba(225,240,255,0.9)_100%)]" />

          <div className="relative space-y-4 px-6">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Juf Aimee zegt</p>
              <h3 className="mt-1 text-base font-bold text-slate-950">
                {analyzing ? "Ik kijk even mee…" : analysis ? "Ik heb je antwoord gelezen!" : "Sla je antwoord op voor feedback"}
              </h3>
            </div>

            {analyzing && (
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-white/70 px-4 py-3 text-sm text-slate-600 ring-1 ring-blue-100">
                <Loader2 className="size-4 animate-spin text-blue-500" />
                <span>Analyseren…</span>
              </div>
            )}

            {error && !analyzing && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
                {error}
              </div>
            )}

            {analysis && !analyzing && tone && (
              <>
                <div className={`flex items-start gap-3 rounded-2xl ${tone.bg} px-4 py-3 ring-1 ${tone.ring}`}>
                  <span className="text-xl">{tone.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold uppercase tracking-wide ${tone.text}`}>{tone.label}</p>
                    {analysis.verdictMessage && (
                      <p className="mt-1 text-sm leading-6 text-slate-700">{analysis.verdictMessage}</p>
                    )}
                  </div>
                </div>

                {analysis.strengths.length > 0 && (
                  <div className="space-y-2 rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-emerald-100">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="size-4 text-emerald-600" />
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Wat ging goed</p>
                    </div>
                    <ul className="space-y-1.5">
                      {analysis.strengths.map((s, i) => (
                        <li className="flex gap-2 text-sm leading-6 text-slate-700" key={i}>
                          <span className="text-emerald-500">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.tips.length > 0 && (
                  <div className="space-y-2 rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-violet-100">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="size-4 text-violet-600" />
                      <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Tips om te verbeteren</p>
                    </div>
                    <ul className="space-y-1.5">
                      {analysis.tips.map((t, i) => (
                        <li className="flex gap-2 text-sm leading-6 text-slate-700" key={i}>
                          <span className="text-violet-500">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type UploadedFile = {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
};

function ReflectionSection({
  reflection,
  saving,
  saved,
  onChange,
  onSave,
  firstName,
}: {
  reflection: string;
  saving: boolean;
  saved: boolean;
  onChange: (v: string) => void;
  onSave: () => void;
  firstName: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-blue-100 bg-[linear-gradient(180deg,#dce4ff_0%,#cdd8ff_100%)] shadow-[0_12px_36px_rgba(92,114,180,0.06)]">
      <div className="flex items-center gap-3 border-b border-blue-100 px-6 py-4">
        <div className="flex size-8 items-center justify-center rounded-xl bg-blue-100">
          <Lightbulb className="size-4 text-blue-700" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-950">Reflectie</h2>
          <p className="text-xs text-slate-500">Wat heb je geleerd? Wat vond je makkelijk of moeilijk?</p>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Keuze-opties */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-blue-800">Klik op wat voor jou klopt — je kunt er meerdere kiezen:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Ik heb vandaag iets nieuws geleerd.",
              "Ik vond het moeilijk, maar ik heb het toch geprobeerd.",
              "Ik vond de opdracht leuk om te doen.",
              "Ik ben trots op wat ik heb gemaakt.",
              "Ik wil dit onderwerp beter leren begrijpen.",
              "Het was makkelijker dan ik dacht.",
              "Ik had hulp nodig.",
            ].map((answer) => {
              const selected = reflection.includes(answer);
              return (
                <button
                  key={answer}
                  type="button"
                  onClick={() => {
                    if (selected) {
                      onChange(reflection.replace(answer, "").replace(/\n{3,}/g, "\n\n").trim());
                    } else {
                      onChange(reflection ? `${reflection.trim()}\n${answer}` : answer);
                    }
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    selected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-blue-300 bg-white/70 text-blue-800 hover:bg-white hover:border-blue-500"
                  }`}
                >
                  {answer}
                </button>
              );
            })}
          </div>
        </div>

        <textarea
          className="min-h-[140px] w-full resize-y rounded-2xl border border-blue-200 bg-white px-5 py-4 text-[1.02rem] leading-8 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Hé ${firstName}, schrijf hier wat je hebt geleerd of wat je de volgende keer anders zou doen…`}
          value={reflection}
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">Je reflectie wordt opgeslagen en helpt je leraar je beter te begeleiden.</p>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving || !reflection.trim()}
            onClick={onSave}
            type="button"
          >
            <span>{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}</span>
            Opslaan
          </button>
        </div>

        {saved && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
            Reflectie opgeslagen!
          </div>
        )}
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AssignmentWorkspaceClient({
  assignmentId,
  assignmentDescription,
  assignmentTitle,
  assignmentTip,
  bloomLevel,
  firstName,
  initialWork,
  initialReflection = "",
  isCompleted,
  studentId,
  teacherFeedback,
}: {
  assignmentId: string;
  assignmentDescription: string;
  assignmentTitle: string;
  assignmentTip?: string | null;
  bloomLevel: string;
  firstName: string;
  initialWork: string;
  initialReflection?: string;
  isCompleted: boolean;
  studentId: string;
  teacherFeedback?: string | null;
}) {
  const [work, setWork] = useState(initialWork);
  const [reflection, setReflection] = useState(initialReflection);
  const [savingReflection, setSavingReflection] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [tips, setTips] = useState<string[]>([]);
  const [loadingTips, setLoadingTips] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(isCompleted);
  const [savedOnce, setSavedOnce] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [analysis, setAnalysis] = useState<AnswerAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
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

    fetch(`/api/prototype/submission?assignmentId=${assignmentId}`)
      .then((r) => r.json())
      .then((data) => setUploadedFiles(data.submissions ?? []))
      .catch(() => {});
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
      void analyzeAnswer();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  }

  async function analyzeAnswer() {
    if (!work.trim()) return;
    setAnalyzing(true);
    setAnalysisError("");
    try {
      const response = await fetch("/api/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze_answer", studentId, assignmentId, work }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Analyse mislukt.");
      setAnalysis({
        verdict: data.verdict ?? "op weg",
        verdictMessage: data.verdictMessage ?? "",
        strengths: Array.isArray(data.strengths) ? data.strengths : [],
        tips: Array.isArray(data.tips) ? data.tips : [],
      });
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "Analyse mislukt.");
    } finally {
      setAnalyzing(false);
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

  async function uploadFile(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assignmentId", assignmentId);
      formData.append("studentId", studentId);

      const response = await fetch("/api/prototype/submission", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Uploaden mislukt.");
      setUploadedFiles((prev) => [data.submission, ...prev]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Uploaden mislukt.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function saveReflection() {
    if (!reflection.trim()) return;
    setSavingReflection(true);
    setReflectionSaved(false);
    try {
      const response = await fetch("/api/prototype/student-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reflect", studentId, assignmentId, reflection }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Opslaan mislukt.");
      setReflectionSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reflectie opslaan mislukt.");
    } finally {
      setSavingReflection(false);
    }
  }

  async function deleteFile(submissionId: string) {
    try {
      await fetch(
        `/api/prototype/submission?submissionId=${submissionId}&studentId=${studentId}`,
        { method: "DELETE" },
      );
      setUploadedFiles((prev) => prev.filter((f) => f.id !== submissionId));
    } catch {
      // stil falen
    }
  }

  const showAnalysis = analyzing || analysis !== null || analysisError !== "";
  const chatSidebar = (
    <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
      {showAnalysis && (
        <AimeeAnalysisCard analyzing={analyzing} analysis={analysis} error={analysisError} />
      )}
      <StudentChatClient
        assignmentDescription={assignmentDescription}
        assignmentId={assignmentId}
        assignmentTip={assignmentTip ?? null}
        assignmentTitle={assignmentTitle}
        assignmentType="TEXT"
        compact
        draftWork={work}
        studentId={studentId}
        studentName={firstName}
      />
    </aside>
  );

  if (completed) {
    return (
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
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
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{work}</p>
                </div>
              )}
              {uploadedFiles.length > 0 && (
                <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-left">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ingediende bestanden
                  </p>
                  <ul className="space-y-2">
                    {uploadedFiles.map((f) => (
                      <li key={f.id} className="flex items-center gap-2 text-sm text-slate-700">
                        <FileText className="size-4 shrink-0 text-blue-500" />
                        <span className="flex-1 truncate">{f.fileName}</span>
                        <span className="text-xs text-slate-400">{formatBytes(f.fileSize)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {teacherFeedback && (
            <div className="overflow-hidden rounded-3xl border border-violet-200 bg-[linear-gradient(180deg,#faf8ff_0%,#f3f0ff_100%)] shadow-[0_12px_36px_rgba(92,114,180,0.08)]">
              <div className="flex items-center gap-3 border-b border-violet-100 px-6 py-4">
                <div className="flex size-8 items-center justify-center rounded-xl bg-violet-100">
                  <MessageSquare className="size-4 text-violet-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-950">Feedback van je leraar</h2>
                  <p className="text-xs text-slate-500">Jouw leraar heeft feedback gegeven op deze opdracht</p>
                </div>
              </div>
              <div className="px-6 py-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{teacherFeedback}</p>
              </div>
            </div>
          )}
        </div>

        {chatSidebar}

        {/* Reflectie */}
        <ReflectionSection
          reflection={reflection}
          saving={savingReflection}
          saved={reflectionSaved}
          onChange={setReflection}
          onSave={saveReflection}
          firstName={firstName}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
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

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>{wordCount} woorden · {charCount} tekens</span>
              {savedOnce && !saving && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="size-3" />
                  Opgeslagen
                </span>
              )}
            </div>

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

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving || submitting}
                onClick={saveWork}
                type="button"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Opslaan
              </button>
              <button
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(98,101,255,0.22)] transition hover:from-violet-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving || submitting || (work.trim().length < 5 && uploadedFiles.length === 0)}
                onClick={submitWork}
                type="button"
              >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Inleveren
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-slate-400">
              Tip: sla je werk op terwijl je bezig bent. Juf Aimee kan je dan ook beter verder helpen vanaf je laatste versie.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[0_12px_36px_rgba(92,114,180,0.06)]">
          <div className="flex items-center gap-3 border-b border-blue-100 px-6 py-4">
            <div className="flex size-8 items-center justify-center rounded-xl bg-blue-100">
              <Paperclip className="size-4 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-950">Bestand toevoegen</h2>
              <p className="text-xs text-slate-500">
                Upload een Word bestand, PDF of afbeelding van je werk
              </p>
            </div>
          </div>

          <div className="px-6 py-5">
            <input
              ref={fileInputRef}
              type="file"
              accept=".doc,.docx,.pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadFile(file);
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 px-4 py-4 text-sm font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {uploading ? "Bezig met uploaden…" : "Klik om een bestand te uploaden"}
            </button>
            <p className="mt-2 text-center text-xs text-slate-400">
              .docx, .doc, .pdf, .png, .jpg - max 10 MB
            </p>

            {uploadError && (
              <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {uploadError}
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <ul className="mt-4 space-y-2">
                {uploadedFiles.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <FileText className="size-5 shrink-0 text-blue-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{f.fileName}</p>
                      <p className="text-xs text-slate-400">
                        {formatBytes(f.fileSize)} · {new Date(f.uploadedAt).toLocaleDateString("nl-NL")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteFile(f.id)}
                      className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                      title="Bestand verwijderen"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      {/* Reflectie */}
      <ReflectionSection
        reflection={reflection}
        saving={savingReflection}
        saved={reflectionSaved}
        onChange={setReflection}
        onSave={saveReflection}
        firstName={firstName}
      />

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

      {chatSidebar}
    </div>
  );
}
