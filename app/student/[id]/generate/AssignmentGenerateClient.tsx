"use client";

import { useState } from "react";
import {
  Brain,
  Check,
  CheckCircle2,
  Cylinder,
  Database,
  Lightbulb,
  Loader2,
  Lock,
  PencilLine,
  RotateCcw,
  Scale,
  Search,
  Sparkles,
  Target,
} from "lucide-react";

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

const BLOOM_OPTIONS = [
  "Onthouden",
  "Begrijpen",
  "Toepassen",
  "Analyseren",
  "Evalueren",
  "Creëren",
] as const;

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

export type StudentProps = {
  id: string;
  fullName: string;
  bloomLevel: string;
  age: number | null;
  emoji: string;
  interests: string[];
  learningStyle: string;
  workMethod: string;
  concentration: string;
  strengths: string[];
  smartTips: string[];
};

function SectionCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-[28px] border bg-white/90 p-8 shadow-[0_18px_50px_rgba(92,114,180,0.08)] backdrop-blur ${className}`}
    >
      {children}
    </section>
  );
}

function CriteriaRow({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
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

function RagStep({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
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

export function AssignmentGenerateClient({ student }: { student: StudentProps }) {
  const [selectedBloom, setSelectedBloom] = useState(student.bloomLevel || "Toepassen");
  const [selectedVak, setSelectedVak] = useState<string>(BASISSCHOOL_VAKKEN[0]);
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [revising, setRevising] = useState(false);
  const [approving, setApproving] = useState(false);
  const [sources, setSources] = useState<string[]>([]);
  const [analysisError, setAnalysisError] = useState<string>("");
  const [teacherPrompt, setTeacherPrompt] = useState("");
  const [approvalMessage, setApprovalMessage] = useState("");
  const [generatedAssignment, setGeneratedAssignment] = useState<GeneratedAssignment | null>(null);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [judgeSteps, setJudgeSteps] = useState<CriteriumScore[]>([]);
  const [judgeTotal, setJudgeTotal] = useState(0);
  const [judging, setJudging] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  async function searchSources() {
    setSearching(true);
    setAnalysisError("");
    setApprovalMessage("");

    try {
      const response = await fetch("/api/prototype/assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "search",
          studentId: student.id,
          focusArea: selectedVak,
          bloomLevel: selectedBloom,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error((data as { error?: string }).error ?? "Bronnen zoeken mislukt.");
      setSources((data as { sources?: string[] }).sources ?? []);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Bronnen zoeken mislukt.");
    } finally {
      setSearching(false);
    }
  }

  async function runGenerateStream(action: "generate" | "revise") {
    const setLoading = action === "generate" ? setGenerating : setRevising;
    setLoading(true);
    setAnalysisError("");
    setApprovalMessage("");
    setJudgeResult(null);
    setJudgeSteps([]);
    setJudgeTotal(0);
    setJudging(false);

    try {
      const response = await fetch("/api/prototype/assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          studentId: student.id,
          focusArea: selectedVak,
          bloomLevel: selectedBloom,
          teacherPrompt: action === "revise" ? teacherPrompt : undefined,
          currentAssignment: action === "revise" ? generatedAssignment : undefined,
        }),
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Opdracht genereren mislukt.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const event = JSON.parse(trimmed) as { type: string; data: unknown };

            if (event.type === "sources") {
              setSources(event.data as string[]);
            } else if (event.type === "assignment") {
              setGeneratedAssignment(event.data as GeneratedAssignment);
              setTeacherPrompt("");
            } else if (event.type === "judge_start") {
              setJudging(true);
              setJudgeTotal((event.data as { total: number }).total);
            } else if (event.type === "judge_step") {
              setJudgeSteps((prev) => [...prev, event.data as CriteriumScore]);
            } else if (event.type === "judge_done") {
              setJudgeResult(event.data as JudgeResult);
              setJudging(false);
            } else if (event.type === "error") {
              throw new Error((event.data as { message: string }).message);
            }
          } catch (parseError) {
            if (parseError instanceof SyntaxError) continue;
            throw parseError;
          }
        }
      }
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Opdracht genereren mislukt.");
      setJudging(false);
    } finally {
      setLoading(false);
    }
  }

  async function approveAssignment() {
    if (!generatedAssignment) return;
    setApproving(true);
    setAnalysisError("");
    setApprovalMessage("");

    try {
      const response = await fetch("/api/prototype/assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          studentId: student.id,
          focusArea: selectedVak,
          bloomLevel: selectedBloom,
          currentAssignment: generatedAssignment,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error((data as { error?: string }).error ?? "Opdracht goedkeuren mislukt.");
      setApprovalMessage("Opdracht opgeslagen als nieuwe assignment.");
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Opdracht goedkeuren mislukt.");
    } finally {
      setApproving(false);
    }
  }

  async function rejectAssignment() {
    if (generatedAssignment) {
      try {
        await fetch("/api/prototype/assignment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "reject",
            studentId: student.id,
            rejectReason,
            assignmentTitle: generatedAssignment.title,
          }),
        });
      } catch {
        // Doorgaan ook als opslaan mislukt
      }
    }

    setGeneratedAssignment(null);
    setTeacherPrompt(rejectReason);
    setApprovalMessage("");
    setAnalysisError("");
    setRejectMode(false);
    setRejectReason("");
  }

  return (
    <div className="space-y-8">
      <SectionCard className="border-slate-200/80">
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-[0_14px_24px_rgba(98,101,255,0.2)]">
              <Sparkles className="size-7" />
            </div>
            <div>
              <h1 className="text-[2.2rem] font-semibold tracking-tight text-slate-950">
                AI Opdracht Genereren
              </h1>
              <p className="text-[1.2rem] text-slate-500">Voor {student.fullName}</p>
            </div>
          </div>

          <div className="flex items-center gap-5 rounded-3xl bg-slate-100 px-8 py-7">
            <div className="text-5xl">{student.emoji}</div>
            <div>
              <p className="text-[1.1rem] font-semibold text-slate-950">
                {student.fullName}
                {student.age ? `, ${student.age} jaar` : ""}
              </p>
              <p className="text-[1.05rem] text-slate-600">
                Interesses: {student.interests.join(", ")}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[1.05rem] font-semibold text-slate-950">
                Bloom&apos;s Taxonomie Niveau
              </label>
              <select
                className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[1.05rem] text-slate-950 outline-none"
                onChange={(e) => setSelectedBloom(e.target.value)}
                value={selectedBloom}
              >
                {BLOOM_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <p className="text-[1.05rem] text-slate-500">
                Huidig niveau van {student.fullName}: {student.bloomLevel || "onbekend"}
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-[1.05rem] font-semibold text-slate-950">
                Schoolvak
              </label>
              <select
                className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[1.05rem] text-slate-950 outline-none"
                onChange={(e) => setSelectedVak(e.target.value)}
                value={selectedVak}
              >
                {BASISSCHOOL_VAKKEN.map((vak) => (
                  <option key={vak} value={vak}>
                    {vak}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <button
                className="flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-slate-600 to-slate-700 text-[1.15rem] font-semibold text-white shadow-md transition hover:from-slate-700 hover:to-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={searching || generating}
                onClick={searchSources}
                type="button"
              >
                {searching ? <Loader2 className="size-5 animate-spin" /> : <Search className="size-5" />}
                Zoek bronnen met AI
              </button>
              <button
                className="flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 text-[1.15rem] font-semibold text-white shadow-[0_16px_28px_rgba(98,101,255,0.22)] transition hover:from-violet-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={searching || generating}
                onClick={() => runGenerateStream("generate")}
                type="button"
              >
                {generating ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Sparkles className="size-5" />
                )}
                Genereer opdracht met AI
              </button>
            </div>

            {analysisError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {analysisError}
              </div>
            ) : null}
          </div>
        </div>
      </SectionCard>

      <SectionCard className="border-violet-200 bg-[linear-gradient(180deg,rgba(252,250,255,0.95),rgba(247,243,255,0.88))]">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Brain className="size-6 text-violet-600" />
            <h2 className="text-[1.15rem] font-semibold text-slate-950">
              AI-criteria voor opdrachtgeneratie
            </h2>
          </div>
          <p className="text-[1.1rem] leading-8 text-slate-700">
            De AI gebruikt de volgende criteria om een passende opdracht te genereren voor{" "}
            {student.fullName}:
          </p>
          <div className="space-y-4">
            <CriteriaRow
              label="Schoolvak"
              value={selectedVak}
              description="Opdracht sluit aan bij het gekozen schoolvak."
            />
            <CriteriaRow
              label="Bloom niveau"
              value={selectedBloom}
              description="Past de moeilijkheid en het type denkopdracht aan op het actuele niveau."
            />
            <CriteriaRow
              label="Leerstijl"
              value={student.learningStyle}
              description="De opdracht sluit aan op de voorkeur voor verwerken en leren."
            />
            <CriteriaRow
              label="Werkmethode"
              value={student.workMethod}
              description="De opbouw van de opdracht past bij de gewenste manier van werken."
            />
            <CriteriaRow
              label="Concentratievermogen"
              value={student.concentration}
              description="Helpt bij het bepalen van lengte, zelfstandigheid en complexiteit."
            />
          </div>
          <div className="rounded-[18px] bg-sky-50 px-5 py-4 text-[1.03rem] leading-7 text-slate-700">
            <span className="font-semibold text-slate-900">Leraar regie:</span> U behoudt
            volledige controle. U kunt de opdracht aanpassen, opnieuw genereren of afwijzen
            voordat deze aan de leerling wordt gegeven.
          </div>
        </div>
      </SectionCard>

      <SectionCard className="border-blue-200 bg-[linear-gradient(180deg,rgba(250,253,255,0.96),rgba(243,249,255,0.92))]">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Lightbulb className="size-6 text-blue-500" />
            <h2 className="text-[1.15rem] font-semibold text-slate-950">
              Slimme detectietips voor {student.fullName}
            </h2>
          </div>
          <ul className="space-y-3 text-[1.05rem] leading-7 text-slate-700">
            {student.smartTips.map((tip) => (
              <li className="flex items-start gap-3" key={tip}>
                <span className="mt-1 text-lg">💡</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </SectionCard>

      <SectionCard className="border-emerald-200 bg-[linear-gradient(180deg,rgba(251,255,253,0.96),rgba(244,255,248,0.92))]">
        <div className="space-y-7">
          <div className="flex items-center gap-3">
            <Cylinder className="size-6 text-emerald-600" />
            <h2 className="text-[1.15rem] font-semibold text-slate-950">
              RAG proces - Retrieval-Augmented Generation
            </h2>
          </div>
          <p className="text-[1.1rem] leading-8 text-slate-700">
            Het AI-systeem gebruikt bestaande onderwijsmaterialen uit het OPP en leerlingcontext
            uit de database om nieuwe, gepersonaliseerde opdrachten te genereren.
          </p>
          <div className="space-y-5">
            <RagStep
              icon={<Search className="size-7" />}
              title="1. Zoeken (Retrieval)"
              description="AI zoekt relevante OPP-passages en context in de database."
            />
            <RagStep
              icon={<Database className="size-7" />}
              title="2. Context verrijken (Augmented)"
              description="Gevonden context wordt verrijkt met leerlingprofiel en Bloom-niveau."
            />
            <RagStep
              icon={<Sparkles className="size-7" />}
              title="3. Genereren (Generation)"
              description="Er ontstaat een nieuwe opdracht op basis van bronmateriaal en profieldata."
            />
          </div>

          {sources.length > 0 ? (
            <div className="space-y-3 rounded-[18px] border border-slate-200 bg-white px-4 py-4">
              <p className="text-sm font-semibold text-slate-900">Gevonden bronnen</p>
              <div className="space-y-2 text-sm leading-6 text-slate-700">
                {sources.map((source, index) => (
                  <p key={`${index}-${source.slice(0, 20)}`}>
                    {index + 1}. {source}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-[1.02rem] leading-7 text-slate-600">
            <span className="font-semibold text-slate-900">Transparantie:</span> AI-gegenereerde
            opdrachten zijn afgeleid uit bestaande bronnen. De gebruikte context blijft altijd
            uitlegbaar.
          </div>
        </div>
      </SectionCard>

      {generatedAssignment ? (
        <SectionCard className="border-slate-200/80">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Sparkles className="size-6 text-violet-600" />
              <h2 className="text-[1.2rem] font-semibold text-slate-950">Gegenereerde opdracht</h2>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-slate-950">{generatedAssignment.title}</h3>
              <div className="rounded-2xl bg-slate-50 px-5 py-4 text-[1.04rem] leading-8 text-slate-700 whitespace-pre-wrap">
                {generatedAssignment.assignment}
              </div>
            </div>
            <div className="rounded-2xl bg-violet-50 px-5 py-4">
              <p className="mb-1 text-sm font-semibold text-slate-900">Waarom deze opdracht?</p>
              <p className="text-sm leading-7 text-slate-700">{generatedAssignment.rationale}</p>
            </div>

            {(judging || judgeSteps.length > 0 || judgeResult) ? (
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Scale className="size-4 text-violet-600" />
                    <p className="text-sm font-semibold text-slate-900">LLM-as-Judge beoordeling</p>
                  </div>
                  {judgeResult ? (
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        judgeResult.beslissing === "goedkeuren"
                          ? "bg-emerald-100 text-emerald-800"
                          : judgeResult.beslissing === "flaggen"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {judgeResult.beslissing === "goedkeuren"
                        ? "✓ Goedgekeurd"
                        : judgeResult.beslissing === "flaggen"
                          ? "⚠ Menselijke review nodig"
                          : "↺ Opnieuw genereren"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                      <Loader2 className="size-3 animate-spin" />
                      Beoordeelt...
                    </span>
                  )}
                </div>

                {judgeTotal > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-1.5 rounded-full bg-violet-400 transition-all duration-500"
                        style={{ width: `${(judgeSteps.length / judgeTotal) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">
                      {judgeSteps.length}/{judgeTotal}
                    </span>
                  </div>
                )}

                {judgeResult && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${
                          judgeResult.genormaliseerdeScore >= 0.75
                            ? "bg-emerald-500"
                            : judgeResult.genormaliseerdeScore >= 0.5
                              ? "bg-amber-400"
                              : "bg-rose-500"
                        }`}
                        style={{ width: `${judgeResult.genormaliseerdeScore * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
                      {judgeResult.totaalScore}/{judgeResult.maxScore} ({Math.round(judgeResult.genormaliseerdeScore * 100)}%)
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  {judgeSteps.map((s) => (
                    <div
                      key={s.criterium}
                      className="animate-in fade-in slide-in-from-bottom-1 rounded-xl bg-white px-4 py-3 ring-1 ring-slate-100 duration-300"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-700">
                          C{s.criterium}: {s.naam}
                        </p>
                        <span
                          className={`ml-2 shrink-0 text-xs font-bold ${
                            s.score >= 4
                              ? "text-emerald-600"
                              : s.score >= 3
                                ? "text-amber-600"
                                : "text-rose-600"
                          }`}
                        >
                          {s.score}/5
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{s.feedback}</p>
                    </div>
                  ))}
                  {judging && judgeSteps.length < judgeTotal && (
                    <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 ring-1 ring-slate-100">
                      <Loader2 className="size-3 shrink-0 animate-spin text-violet-500" />
                      <p className="text-xs text-slate-500">
                        Criterium {judgeSteps.length + 1} wordt beoordeeld...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

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
            </div>

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
                  De reden van afkeuring wordt opgeslagen zodat de AI dit meeneemt bij de volgende
                  generatie.
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
                  disabled={revising || approving || !teacherPrompt.trim()}
                  onClick={() => runGenerateStream("revise")}
                  type="button"
                >
                  {revising ? <Loader2 className="size-4 animate-spin" /> : <PencilLine className="size-4" />}
                  Aanpassen
                </button>
                <button
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={revising || approving}
                  onClick={() => setRejectMode(true)}
                  type="button"
                >
                  <RotateCcw className="size-4" />
                  Afkeuren
                </button>
                <button
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={revising || approving}
                  onClick={approveAssignment}
                  type="button"
                >
                  {approving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  Goedkeuren
                </button>
              </div>
            )}

            {approvalMessage ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {approvalMessage}
              </div>
            ) : null}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard className="border-violet-200 bg-[linear-gradient(180deg,rgba(252,250,255,0.96),rgba(247,243,255,0.92))]">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Target className="size-6 text-amber-500" />
            <h2 className="text-[1.15rem] font-semibold text-slate-950">Verantwoorde AI</h2>
          </div>
          <p className="text-[1.1rem] leading-8 text-slate-700">
            Juf Aimee gebruikt uitlegbare AI om transparantie te bieden over waarom opdrachten
            worden gegenereerd. De leraar houdt altijd de regie en kan opdrachten aanpassen of
            opnieuw genereren.
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
