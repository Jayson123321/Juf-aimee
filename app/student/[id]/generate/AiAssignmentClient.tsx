"use client";

import { useState } from "react";
import {
  Check,
  Brain,
  BookOpen,
  CheckCircle2,
  Clock,
  Cylinder,
  Database,
  MessageSquare,
  PencilLine,
  RotateCcw,
  Lightbulb,
  Loader2,
  Lock,
  Scale,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import type { PrototypeBloomLevel, PrototypeStudent } from "@/lib/prototype-runtime";

// ─── Types ────────────────────────────────────────────────────────────────────

type GeneratedAssignment = {
  title: string;
  assignment: string;
  rationale: string;
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
  beslissing: "goedkeuren" | "flaggen" | "opnieuw_genereren" | "escaleren";
};

// ─── Constanten ───────────────────────────────────────────────────────────────

const OPEN_FOCUS_OPTIONS = ["Zelfgekozen onderwerp", "Actuele gebeurtenissen", "Eigen experiment opzetten"] as const;

const FOCUS_AREA_OPTIONS = [
  { group: "Vakgebied", options: ["Rekenen en wiskunde", "Taal en schrijven", "Wereldoriëntatie", "Natuur en techniek", "Kunst en creativiteit"] },
  { group: "Denkvaardigheden", options: ["Verbanden leggen tussen begrippen", "Argumenteren en standpunt onderbouwen", "Hypothese opstellen en testen", "Ontwerpen en prototypen", "Kritisch bronnen vergelijken"] },
  { group: "Interesses", options: ["Programmeren en logica", "Creatief schrijven en verhalen", "Onderzoek en presenteren", "Bouwen en constructies", "Tekstanalyse en media"] },
  { group: "Open", options: OPEN_FOCUS_OPTIONS },
] as const;

const BASISSCHOOL_VAKKEN = [
  "Rekenen / Wiskunde", "Nederlandse taal", "Begrijpend lezen", "Spelling",
  "Technisch lezen", "Schrijven", "Engels", "Aardrijkskunde", "Geschiedenis",
  "Natuur & Techniek", "Biologie", "Verkeer", "Beeldende vorming", "Muziek",
  "Bewegingsonderwijs", "Burgerschap",
] as const;

const TIME_OPTIONS = [
  "15 minuten", "30 minuten", "45 minuten", "1 uur",
  "1,5 uur", "2 uur", "Meerdere lessen (2–3)", "Weekopdracht",
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

export function AiAssignmentClient({
  bloomOptions,
  student,
}: {
  bloomOptions: PrototypeBloomLevel[];
  student: PrototypeStudent;
}) {
  // Instellingen
  const [selectedBloom, setSelectedBloom] = useState(student.status);
  const [selectedVak, setSelectedVak] = useState<string>(BASISSCHOOL_VAKKEN[0]);
  const [focusArea, setFocusArea] = useState("");
  const [customFocusArea, setCustomFocusArea] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("45 minuten");

  const isOpenFocus = (OPEN_FOCUS_OPTIONS as readonly string[]).includes(focusArea);
  const resolvedFocusArea = isOpenFocus && customFocusArea.trim()
    ? customFocusArea.trim()
    : focusArea || selectedVak;

  // Status
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [error, setError] = useState("");
  const [approvalMessage, setApprovalMessage] = useState("");

  // Resultaten
  const [sources, setSources] = useState<string[]>([]);
  const [assignment, setAssignment] = useState<GeneratedAssignment | null>(null);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);

  // Na goedkeuring: feedback van de leraar
  const [savedAssignmentId, setSavedAssignmentId] = useState<string | null>(null);
  const [teacherFeedback, setTeacherFeedback] = useState("");
  const [feedbackSaved, setFeedbackSaved] = useState(false);

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
    if (!response.ok) throw new Error((data as { error?: string }).error ?? "Er is iets misgegaan.");
    return data;
  }

  // ── Bronnen zoeken ───────────────────────────────────────────────────────────

  async function searchSources() {
    setLoading(true);
    setError("");
    try {
      const data = await callApi({ action: "search", studentId: student.id, focusArea: resolvedFocusArea, bloomLevel: selectedBloom });
      setSources((data as { sources?: string[] }).sources ?? []);
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
        focusArea: resolvedFocusArea,
        bloomLevel: selectedBloom,
        estimatedTime,
        teacherPrompt: action === "revise" ? teacherPrompt : undefined,
        currentAssignment: action === "revise" ? assignment : undefined,
      });
      setSources((data as { sources?: string[] }).sources ?? []);
      setAssignment((data as { assignment?: GeneratedAssignment }).assignment ?? null);
      setJudgeResult((data as { judgeResult?: JudgeResult }).judgeResult ?? null);
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
      const data = await callApi({
        action: "approve",
        studentId: student.id,
        focusArea: resolvedFocusArea,
        bloomLevel: selectedBloom,
        currentAssignment: assignment,
      });
      setSavedAssignmentId((data as { savedAssignmentId?: string }).savedAssignmentId ?? null);
      setFeedbackSaved(false);
      setTeacherFeedback("");
      setApprovalMessage("Opdracht opgeslagen. Voeg hieronder feedback toe voor toekomstige generaties.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opdracht goedkeuren mislukt.");
    } finally {
      setApproving(false);
    }
  }

  // ── Feedback opslaan na uitvoering ────────────────────────────────────────────

  async function saveFeedback() {
    if (!savedAssignmentId || !teacherFeedback.trim()) return;
    setSavingFeedback(true);
    try {
      await callApi({ action: "feedback", studentId: student.id, assignmentId: savedAssignmentId, feedback: teacherFeedback.trim() });
      setFeedbackSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Feedback opslaan mislukt.");
    } finally {
      setSavingFeedback(false);
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
    setJudgeResult(null);
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
              <label className="block text-[1.05rem] font-semibold text-slate-950" htmlFor="vak-select">Schoolvak</label>
              <select
                className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[1.05rem] text-slate-950 outline-none"
                id="vak-select"
                onChange={(e) => setSelectedVak(e.target.value)}
                value={selectedVak}
              >
                {BASISSCHOOL_VAKKEN.map((vak) => (
                  <option key={vak} value={vak}>{vak}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-[1.05rem] font-semibold text-slate-950" htmlFor="focus-select">
                Focusgebied <span className="font-normal text-slate-400">(optioneel)</span>
              </label>
              <select
                className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[1.05rem] text-slate-950 outline-none"
                id="focus-select"
                onChange={(e) => { setFocusArea(e.target.value); setCustomFocusArea(""); }}
                value={focusArea}
              >
                <option value="">— Automatisch op basis van leerlingprofiel —</option>
                {FOCUS_AREA_OPTIONS.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="text-[1.05rem] text-slate-500">Laat leeg om automatisch aan te sluiten op de interesses van de leerling</p>
              {isOpenFocus && (
                <input
                  autoFocus
                  className="h-12 w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 text-[1.05rem] text-slate-950 outline-none ring-2 ring-violet-300 placeholder:text-slate-400"
                  onChange={(e) => setCustomFocusArea(e.target.value)}
                  placeholder={
                    focusArea === "Zelfgekozen onderwerp" ? "Bijv. klimaatverandering, middeleeuwen..." :
                    focusArea === "Actuele gebeurtenissen" ? "Bijv. ruimtevaart, olympische spelen..." :
                    "Bijv. water zuiveren, brugconstructies..."
                  }
                  type="text"
                  value={customFocusArea}
                />
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-[1.05rem] font-semibold text-slate-950" htmlFor="tijd-select">Geschatte tijd</label>
              <select
                className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[1.05rem] text-slate-950 outline-none"
                id="tijd-select"
                onChange={(e) => setEstimatedTime(e.target.value)}
                value={estimatedTime}
              >
                {TIME_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <p className="text-[1.05rem] text-slate-500">De AI past de omvang en diepgang van de opdracht hierop aan</p>
            </div>

            <div className="space-y-4">
              <button
                className="flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-slate-600 to-slate-700 text-[1.15rem] font-semibold text-white shadow-md transition hover:from-slate-700 hover:to-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
                onClick={searchSources}
                type="button"
              >
                {loading ? <Loader2 className="size-5 animate-spin" /> : <Search className="size-5" />}
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
            <CriteriaRow label="Leerling Interesse" value={focusArea || student.interests[0] || "Algemene verdieping"} description="Opdracht sluit aan bij wat de leerling motiveert" />
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
        <SectionCard className="border-violet-300 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,248,255,0.95))] shadow-[0_24px_60px_rgba(109,77,200,0.10)]">
          <div className="space-y-8">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-[0_8px_20px_rgba(98,101,255,0.25)]">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-violet-500">AI-gegenereerde opdracht</p>
                  <h2 className="text-[1.15rem] font-semibold text-slate-950">Klaar voor beoordeling</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{selectedBloom}</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                  <Clock className="size-3" />
                  {estimatedTime}
                </span>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-r from-violet-600 to-blue-600 px-7 py-6 text-white shadow-[0_12px_30px_rgba(98,101,255,0.22)]">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest opacity-75">Opdrachttitel</p>
              <h3 className="text-[1.6rem] font-bold leading-snug">{assignment.title}</h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-700">
                <BookOpen className="size-4 shrink-0" />
                <p className="text-sm font-semibold uppercase tracking-wide">Opdrachtbeschrijving</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-[1.06rem] leading-8 text-slate-800 shadow-[0_4px_12px_rgba(15,23,42,0.04)] whitespace-pre-wrap">
                {assignment.assignment}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-violet-700">
                <Brain className="size-4 shrink-0" />
                <p className="text-sm font-semibold uppercase tracking-wide">Onderbouwing</p>
              </div>
              <div className="rounded-2xl border border-violet-100 bg-violet-50 px-6 py-5">
                <p className="text-[1.04rem] leading-8 text-slate-700">{assignment.rationale}</p>
              </div>
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
                      : judgeResult.beslissing === "escaleren" ? "↑ Geëscaleerd"
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
                      <p className="mt-1 text-xs leading-5 text-slate-500">{s.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback na uitvoering */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <MessageSquare className="size-4 shrink-0" />
                <p className="text-sm font-semibold uppercase tracking-wide">Feedback van de leraar</p>
              </div>
              {savedAssignmentId ? (
                feedbackSaved ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                    Feedback opgeslagen en wordt meegenomen in toekomstige opdrachten.
                  </div>
                ) : (
                  <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-5">
                    <p className="text-sm text-emerald-800">
                      Hoe is de opdracht verlopen? Deze feedback wordt opgeslagen en gebruikt bij het genereren van volgende opdrachten.
                    </p>
                    <textarea
                      autoFocus
                      className="min-h-[100px] w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400"
                      onChange={(e) => setTeacherFeedback(e.target.value)}
                      placeholder="Bijv. de leerling werkte enthousiast maar had moeite met de planning. Volgende keer meer structuur bieden."
                      value={teacherFeedback}
                    />
                    <button
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={savingFeedback || !teacherFeedback.trim()}
                      onClick={saveFeedback}
                      type="button"
                    >
                      {savingFeedback ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                      Feedback opslaan
                    </button>
                  </div>
                )
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 px-6 py-5 text-sm text-slate-400 italic">
                  Keur de opdracht goed om feedback toe te voegen na uitvoering.
                </div>
              )}
            </div>

            <hr className="border-slate-200" />

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
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loading || approving || !teacherPrompt.trim()}
                  onClick={() => generateAssignment("revise")}
                  type="button"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <PencilLine className="size-4" />}
                  Aanpassen
                </button>
                <button
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loading || approving}
                  onClick={() => setRejectMode(true)}
                  type="button"
                >
                  <RotateCcw className="size-4" />
                  Afkeuren
                </button>
                <button
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loading || approving}
                  onClick={approveAssignment}
                  type="button"
                >
                  {approving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  Goedkeuren &amp; opslaan
                </button>
              </div>
            )}

            {approvalMessage && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
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