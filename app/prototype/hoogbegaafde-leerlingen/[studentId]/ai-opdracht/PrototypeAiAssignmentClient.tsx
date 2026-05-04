"use client";

import { useState } from "react";
import {
  Check,
  Brain,
  CheckCircle2,
  Cylinder,
  Database,
  PencilLine,
  RotateCcw,
  Lightbulb,
  Loader2,
  Lock,
  Search,
  Sparkles,
  Target,
  Scale,
} from "lucide-react";
import type { PrototypeBloomLevel, PrototypeStudent } from "@/lib/prototype-runtime";

// ─── Types ────────────────────────────────────────────────────────────────────

type GeneratedAssignment = {
  title: string;
  assignment: string;
  rationale: string;
  sources: string[];
};

type CriteriumScore = {
  criterium: number;
  naam: string;
  feedback: string;
  score: number;
};

type JudgeResult = {
  scores: CriteriumScore[];
  totaalScore: number;
  maxScore: number;
  genormaliseerdeScore: number;
  beslissing: "goedkeuren" | "flaggen" | "opnieuw_genereren";
};

// ─── Constanten ───────────────────────────────────────────────────────────────

const BASISSCHOOL_VAKKEN = [
  "Rekenen / Wiskunde",
  "Nederlandse taal",
  "Begrijpend lezen",
  "Spelling",
  "Technisch lezen",
  "Schrijven",
  "Engels",
  "Aardrijkskunde",
  "Geschiedenis",
  "Natuur & Techniek",
  "Biologie",
  "Verkeer",
  "Beeldende vorming",
  "Muziek",
  "Bewegingsonderwijs",
  "Burgerschap",
] as const;

// ─── UI-hulpcomponenten ───────────────────────────────────────────────────────

function SectionCard({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <section className={`rounded-[28px] border bg-white/90 p-8 shadow-[0_18px_50px_rgba(92,114,180,0.08)] backdrop-blur ${className}`}>
      {children}
    </section>
  );
}

function CriteriaRow({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="flex items-start gap-4 rounded-3xl bg-white px-5 py-4 shadow-[0_8px_22px_rgba(109,123,166,0.08)] ring-1 ring-slate-100">
      <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-emerald-500" />
      <div className="space-y-1">
        <p className="text-[1.05rem] leading-7 text-slate-900">
          <span className="font-semibold">{label}:</span>{" "}
          <span className="text-violet-700">{value}</span>
        </p>
        <p className="text-[1.05rem] leading-7 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function RagStep({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 rounded-[18px] border border-slate-200 bg-white px-4 py-4 shadow-[0_5px_12px_rgba(15,23,42,0.03)]">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div>
        <p className="text-[1.05rem] font-semibold text-slate-950">{title}</p>
        <p className="text-[1.05rem] leading-7 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

// ─── Hoofdcomponent ───────────────────────────────────────────────────────────

export function PrototypeAiAssignmentClient({
  bloomOptions,
  student,
}: {
  bloomOptions: PrototypeBloomLevel[];
  student: PrototypeStudent;
}) {
  // Instellingen
  const [selectedBloom, setSelectedBloom] = useState(student.status);
  const [selectedVak, setSelectedVak] = useState<string>(BASISSCHOOL_VAKKEN[0]);

  // Status
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState("");
  const [approvalMessage, setApprovalMessage] = useState("");

  // Resultaten
  const [sources, setSources] = useState<string[]>([]);
  const [assignment, setAssignment] = useState<GeneratedAssignment | null>(null);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);

  // Leerkrachtsinteractie
  const [teacherPrompt, setTeacherPrompt] = useState("");
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // ── API-hulpfunctie ──────────────────────────────────────────────────────────

  async function callApi(body: Record<string, unknown>) {
    const response = await fetch("/api/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Er is iets misgegaan.");
    return data;
  }

  // ── Bronnen zoeken ───────────────────────────────────────────────────────────

  async function searchSources() {
    setLoading(true);
    setError("");
    try {
      const data = await callApi({ action: "search", studentId: student.id, focusArea: selectedVak, bloomLevel: selectedBloom });
      setSources(data.sources ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bronnen zoeken mislukt.");
    } finally {
      setLoading(false);
    }
  }

  // ── Opdracht genereren of aanpassen ──────────────────────────────────────────

  async function generateAssignment(action: "generate" | "revise") {
    setLoading(true);
    setError("");
    setApprovalMessage("");
    setJudgeResult(null);
    try {
      const data = await callApi({
        action,
        studentId: student.id,
        focusArea: selectedVak,
        bloomLevel: selectedBloom,
        teacherPrompt: action === "revise" ? teacherPrompt : undefined,
        currentAssignment: action === "revise" ? assignment : undefined,
      });
      setSources(data.sources ?? []);
      setAssignment(data.assignment ?? null);
      setJudgeResult(data.judgeResult ?? null);
      if (action === "revise") setTeacherPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opdracht genereren mislukt.");
    } finally {
      setLoading(false);
    }
  }

  // ── Opdracht goedkeuren ───────────────────────────────────────────────────────

  async function approveAssignment() {
    if (!assignment) return;
    setApproving(true);
    setError("");
    try {
      await callApi({ action: "approve", studentId: student.id, focusArea: selectedVak, bloomLevel: selectedBloom, currentAssignment: assignment });
      setApprovalMessage("Opdracht opgeslagen in de database als nieuwe assignment.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opdracht goedkeuren mislukt.");
    } finally {
      setApproving(false);
    }
  }

  // ── Opdracht afkeuren ─────────────────────────────────────────────────────────

  async function rejectAssignment() {
    if (assignment) {
      try {
        await callApi({ action: "reject", studentId: student.id, rejectReason, assignmentTitle: assignment.title });
      } catch {
        // Doorgaan ook als opslaan mislukt
      }
    }
    setAssignment(null);
    setTeacherPrompt(rejectReason);
    setApprovalMessage("");
    setError("");
    setRejectMode(false);
    setRejectReason("");
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* Instellingen + knoppen */}
      <SectionCard className="border-slate-200/80">
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-[0_14px_24px_rgba(98,101,255,0.2)]">
              <Sparkles className="size-7" />
            </div>
            <div>
              <h1 className="text-[2.2rem] font-semibold tracking-tight text-slate-950">AI Opdracht Genereren</h1>
              <p className="text-[1.2rem] text-slate-500">Voor {student.name}</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-3xl bg-slate-100 px-8 py-7">
            <div className="flex items-center gap-5">
              <div className="text-5xl">{student.emoji}</div>
              <div>
                <p className="text-[1.1rem] font-semibold text-slate-950">
                  {student.name}{student.age ? `, ${student.age} jaar` : ""}
                </p>
                <p className="text-[1.05rem] text-slate-600">Interesses: {student.interests.join(", ")}</p>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-[1.05rem] font-semibold ${student.badgeClassName}`}>
              <span>{student.badgeEmoji}</span>
              {student.status}
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[1.05rem] font-semibold text-slate-950">Bloom&apos;s Taxonomie Niveau</label>
              <select
                className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[1.05rem] text-slate-950 outline-none"
                onChange={(e) => setSelectedBloom(e.target.value)}
                value={selectedBloom}
              >
                {bloomOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <p className="text-[1.05rem] text-slate-500">Huidig niveau van {student.name}: {student.status}</p>
            </div>

            <div className="space-y-3">
              <label className="block text-[1.05rem] font-semibold text-slate-950">Schoolvak</label>
              <select
                className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[1.05rem] text-slate-950 outline-none"
                onChange={(e) => setSelectedVak(e.target.value)}
                value={selectedVak}
              >
                {BASISSCHOOL_VAKKEN.map((vak) => (
                  <option key={vak} value={vak}>{vak}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <button
                className="flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 text-[1.15rem] font-semibold text-white shadow-[0_16px_28px_rgba(98,101,255,0.22)] transition hover:from-violet-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
                onClick={searchSources}
                type="button"
              >
                {loading ? <Loader2 className="size-5 animate-spin" /> : <Brain className="size-5" />}
                Zoek Bronnen met AI
              </button>
              <button
                className="flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 text-[1.15rem] font-semibold text-white shadow-[0_16px_28px_rgba(98,101,255,0.22)] transition hover:from-violet-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
                onClick={() => generateAssignment("generate")}
                type="button"
              >
                {loading ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
                Genereer Opdracht met AI
              </button>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* AI-criteria */}
      <SectionCard className="border-violet-200 bg-[linear-gradient(180deg,rgba(252,250,255,0.95),rgba(247,243,255,0.88))]">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Brain className="size-6 text-violet-600" />
            <h2 className="text-[1.15rem] font-semibold text-slate-950">AI-Criteria voor Opdracht Generatie</h2>
          </div>
          <p className="text-[1.1rem] leading-8 text-slate-700">
            De AI gebruikt de volgende criteria om een passende opdracht te genereren voor {student.name}:
          </p>
          <div className="space-y-4">
            <CriteriaRow label="Schoolvak" value={selectedVak} description="Opdracht sluit aan bij wat de leerling motiveert" />
            <CriteriaRow label="Bloom Niveau" value={selectedBloom} description={`Past bij huidig niveau (${selectedBloom}) of daagt uit naar hoger niveau`} />
            <CriteriaRow label="Leerstijl" value={student.learningStyle} description="Opdracht is aangepast aan de voorkeurs-leerstijl" />
            <CriteriaRow label="Werkmethode" value={student.workMethod} description="Opdracht kan op de gewenste manier uitgevoerd worden" />
            <CriteriaRow label="Concentratieboog" value={student.concentration} description="Omvang opdracht past bij concentratievermogen" />
          </div>
          <div className="rounded-[18px] bg-sky-50 px-5 py-4 text-[1.03rem] leading-7 text-slate-700">
            <span className="font-semibold text-slate-900">Leraar Regie:</span> U behoudt volledige controle. U kunt de opdracht aanpassen, opnieuw genereren of afwijzen voordat deze aan de leerling wordt gegeven.
          </div>
        </div>
      </SectionCard>

      {/* Didactische tips */}
      <SectionCard className="border-blue-200 bg-[linear-gradient(180deg,rgba(250,253,255,0.96),rgba(243,249,255,0.92))]">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Lightbulb className="size-6 text-blue-500" />
            <h2 className="text-[1.15rem] font-semibold text-slate-950">Snelle Didactische Tips voor {student.name}</h2>
          </div>
          <ul className="space-y-3 text-[1.05rem] leading-7 text-slate-700">
            {student.didacticTips.map((tip) => (
              <li className="flex items-start gap-3" key={tip}>
                <span className="mt-1 text-lg">💡</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </SectionCard>

      {/* RAG-uitleg + bronnen */}
      <SectionCard className="border-emerald-200 bg-[linear-gradient(180deg,rgba(251,255,253,0.96),rgba(244,255,248,0.92))]">
        <div className="space-y-7">
          <div className="flex items-center gap-3">
            <Cylinder className="size-6 text-emerald-600" />
            <h2 className="text-[1.15rem] font-semibold text-slate-950">RAG Proces - Retrieval-Augmented Generation</h2>
          </div>
          <p className="text-[1.1rem] leading-8 text-slate-700">
            Het AI-systeem gebruikt bestaande onderwijsmaterialen uit het OPP en leerlingcontext uit de database om nieuwe, gepersonaliseerde opdrachten te genereren.
          </p>
          <div className="space-y-5">
            <RagStep icon={<Search className="size-7" />} title="1. Zoeken (Retrieval)" description="AI zoekt relevante OPP-passages en context in de database" />
            <RagStep icon={<Database className="size-7" />} title="2. Context Verrijken (Augmented)" description="Gevonden context wordt verrijkt met leerlingprofiel en Bloom-niveau" />
            <RagStep icon={<Sparkles className="size-7" />} title="3. Genereren (Generation)" description="Qwen genereert daarna een nieuwe opdracht op basis van de gevonden bronnen" />
          </div>

          {sources.length > 0 && (
            <div className="space-y-3 rounded-[18px] border border-slate-200 bg-white px-4 py-4">
              <p className="text-sm font-semibold text-slate-900">Gevonden bronnen</p>
              <div className="space-y-2 text-sm leading-6 text-slate-700">
                {sources.map((source, i) => (
                  <p key={`${i}-${source.slice(0, 20)}`}>{i + 1}. {source}</p>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-[1.02rem] leading-7 text-slate-600">
            <span className="font-semibold text-slate-900">Transparantie:</span> Alle gegenereerde opdrachten zijn gebaseerd op geverifieerde onderwijsmaterialen uit de database. Bronnen worden altijd vermeld.
          </div>
        </div>
      </SectionCard>

      {/* Gegenereerde opdracht */}
      {assignment && (
        <SectionCard className="border-slate-200/80">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Sparkles className="size-6 text-violet-600" />
              <h2 className="text-[1.2rem] font-semibold text-slate-950">Gegenereerde opdracht</h2>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-slate-950">{assignment.title}</h3>
              <div className="rounded-2xl bg-slate-50 px-5 py-4 text-[1.04rem] leading-8 text-slate-700 whitespace-pre-wrap">
                {assignment.assignment}
              </div>
            </div>

            <div className="rounded-2xl bg-violet-50 px-5 py-4">
              <p className="mb-1 text-sm font-semibold text-slate-900">Waarom deze opdracht?</p>
              <p className="text-sm leading-7 text-slate-700">{assignment.rationale}</p>
            </div>

            {/* Judge-resultaat */}
            {judgeResult && (
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Scale className="size-4 text-violet-600" />
                    <p className="text-sm font-semibold text-slate-900">LLM-as-Judge beoordeling</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    judgeResult.beslissing === "goedkeuren" ? "bg-emerald-100 text-emerald-800"
                    : judgeResult.beslissing === "flaggen" ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
                  }`}>
                    {judgeResult.beslissing === "goedkeuren" ? "✓ Goedgekeurd"
                      : judgeResult.beslissing === "flaggen" ? "⚠ Menselijke review nodig"
                      : "↺ Opnieuw genereren"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${
                        judgeResult.genormaliseerdeScore >= 0.75 ? "bg-emerald-500"
                        : judgeResult.genormaliseerdeScore >= 0.5 ? "bg-amber-400"
                        : "bg-rose-500"
                      }`}
                      style={{ width: `${judgeResult.genormaliseerdeScore * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    {judgeResult.totaalScore}/{judgeResult.maxScore} ({Math.round(judgeResult.genormaliseerdeScore * 100)}%)
                  </span>
                </div>

                <div className="space-y-2">
                  {judgeResult.scores.map((s) => (
                    <div key={s.criterium} className="rounded-xl bg-white px-4 py-3 ring-1 ring-slate-100">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-700">C{s.criterium}: {s.naam}</p>
                        <span className={`ml-2 shrink-0 text-xs font-bold ${
                          s.score >= 4 ? "text-emerald-600" : s.score >= 3 ? "text-amber-600" : "text-rose-600"
                        }`}>{s.score}/5</span>
                      </div>
                      <div className="mt-1 space-y-1">
                        {s.feedback.split("\n").filter(Boolean).map((line, i) => {
                          const oppMatch = line.match(/^\*\*OPP:\*\*\s*(.*)/);
                          if (oppMatch) return <p key={i} className="rounded bg-slate-100 px-2 py-1 text-xs leading-5 text-slate-600 italic">{oppMatch[1]}</p>;
                          return <p key={i} className="text-xs leading-5 text-slate-500">{line}</p>;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aanpassen met instructie */}
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
              <label className="block text-sm font-semibold text-slate-900" htmlFor="teacher-prompt">
                Aanpassen met instructie
              </label>
              <textarea
                className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400"
                id="teacher-prompt"
                onChange={(e) => setTeacherPrompt(e.target.value)}
                placeholder="Bijvoorbeeld: maak de opdracht korter, voeg een creatief onderdeel toe of laat haar werken met actuele bronnen."
                value={teacherPrompt}
              />
              <p className="text-xs leading-6 text-slate-500">
                Deze instructie wordt gebruikt om de huidige opdracht gericht aan te passen.
              </p>
            </div>

            {/* Afkeuren-formulier */}
            {rejectMode ? (
              <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-5">
                <label className="block text-sm font-semibold text-rose-900" htmlFor="reject-reason">
                  Waarom wordt deze opdracht afgekeurd? <span className="text-rose-600">*</span>
                </label>
                <textarea
                  autoFocus
                  className="min-h-[100px] w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400"
                  id="reject-reason"
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Bijv. te abstract voor deze leerling, sluit niet aan op de interesse..."
                  value={rejectReason}
                />
                <p className="text-xs leading-6 text-rose-700">
                  HAX G7: de reden van afkeuring is contextuele kennis die alleen de leraar heeft — dit is het moment waarop die kennis het systeem binnenkomt.
                </p>
                <div className="flex gap-3">
                  <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!rejectReason.trim()}
                    onClick={rejectAssignment}
                    type="button"
                  >
                    <RotateCcw className="size-4" />
                    Bevestig afkeuring
                  </button>
                  <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    onClick={() => setRejectMode(false)}
                    type="button"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loading || approving || !teacherPrompt.trim()}
                  onClick={() => generateAssignment("revise")}
                  type="button"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <PencilLine className="size-4" />}
                  Aanpassen
                </button>
                <button
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loading || approving}
                  onClick={() => setRejectMode(true)}
                  type="button"
                >
                  <RotateCcw className="size-4" />
                  Afkeuren
                </button>
                <button
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loading || approving}
                  onClick={approveAssignment}
                  type="button"
                >
                  {approving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  Goedkeuren
                </button>
              </div>
            )}

            {approvalMessage && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {approvalMessage}
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Verantwoorde AI */}
      <SectionCard className="border-violet-200 bg-[linear-gradient(180deg,rgba(252,250,255,0.96),rgba(247,243,255,0.92))]">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Target className="size-6 text-amber-500" />
            <h2 className="text-[1.15rem] font-semibold text-slate-950">Verantwoorde AI</h2>
          </div>
          <p className="text-[1.1rem] leading-8 text-slate-700">
            Juf Aimee gebruikt uitlegbare AI om transparantie te bieden over waarom opdrachten worden gegenereerd. De leraar houdt altijd de regie en kan opdrachten aanpassen of opnieuw genereren.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[1rem] text-slate-700 ring-1 ring-slate-200">
              <Lock className="size-4 text-amber-500" />
              Privacy (AVG)
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[1rem] text-slate-700 ring-1 ring-slate-200">
              <Target className="size-4 text-rose-500" />
              Gepersonaliseerd
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[1rem] text-slate-700 ring-1 ring-slate-200">
              <Brain className="size-4 text-fuchsia-500" />
              Bloom&apos;s Taxonomie
            </span>
          </div>
        </div>
      </SectionCard>

    </div>
  );
}
