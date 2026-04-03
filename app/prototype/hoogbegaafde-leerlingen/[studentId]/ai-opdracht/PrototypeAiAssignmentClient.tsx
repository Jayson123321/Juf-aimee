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
} from "lucide-react";
import type { PrototypeBloomLevel, PrototypeStudent } from "@/lib/prototype-runtime";

type GeneratedAssignment = {
  title: string;
  assignment: string;
  rationale: string;
  sources: string[];
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

export function PrototypeAiAssignmentClient({
  bloomOptions,
  student,
}: {
  bloomOptions: PrototypeBloomLevel[];
  student: PrototypeStudent;
}) {
  const [selectedBloom, setSelectedBloom] = useState(student.status);
  const [focusArea, setFocusArea] = useState(student.interests[0] ?? "");
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [revising, setRevising] = useState(false);
  const [approving, setApproving] = useState(false);
  const [sources, setSources] = useState<string[]>([]);
  const [analysisError, setAnalysisError] = useState<string>("");
  const [teacherPrompt, setTeacherPrompt] = useState("");
  const [approvalMessage, setApprovalMessage] = useState("");
  const [generatedAssignment, setGeneratedAssignment] = useState<GeneratedAssignment | null>(null);
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
          focusArea,
          bloomLevel: selectedBloom,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Bronnen zoeken mislukt.");
      setSources(data.sources ?? []);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Bronnen zoeken mislukt.");
    } finally {
      setSearching(false);
    }
  }

  async function generateAssignment() {
    setGenerating(true);
    setAnalysisError("");
    setApprovalMessage("");

    try {
      const response = await fetch("/api/prototype/assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          studentId: student.id,
          focusArea,
          bloomLevel: selectedBloom,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Opdracht genereren mislukt.");
      setSources(data.sources ?? []);
      setGeneratedAssignment(data.assignment ?? null);
      setTeacherPrompt("");
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Opdracht genereren mislukt.");
    } finally {
      setGenerating(false);
    }
  }

  async function reviseAssignment() {
    if (!generatedAssignment) return;

    setRevising(true);
    setAnalysisError("");
    setApprovalMessage("");

    try {
      const response = await fetch("/api/prototype/assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "revise",
          studentId: student.id,
          focusArea,
          bloomLevel: selectedBloom,
          teacherPrompt,
          currentAssignment: generatedAssignment,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Opdracht aanpassen mislukt.");
      setSources(data.sources ?? []);
      setGeneratedAssignment(data.assignment ?? null);
      setTeacherPrompt("");
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Opdracht aanpassen mislukt.");
    } finally {
      setRevising(false);
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
          focusArea,
          bloomLevel: selectedBloom,
          currentAssignment: generatedAssignment,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Opdracht goedkeuren mislukt.");
      setApprovalMessage("Opdracht opgeslagen in de database als nieuwe assignment.");
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
              <p className="text-[1.2rem] text-slate-500">Voor {student.name}</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-3xl bg-slate-100 px-8 py-7">
            <div className="flex items-center gap-5">
              <div className="text-5xl">{student.emoji}</div>
              <div>
                <p className="text-[1.1rem] font-semibold text-slate-950">
                  {student.name}
                  {student.age ? `, ${student.age} jaar` : ""}
                </p>
                <p className="text-[1.05rem] text-slate-600">
                  Interesses: {student.interests.join(", ")}
                </p>
              </div>
            </div>
            <div
              className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-[1.05rem] font-semibold ${student.badgeClassName}`}
            >
              <span>{student.badgeEmoji}</span>
              {student.status}
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[1.05rem] font-semibold text-slate-950">
                Bloom&apos;s Taxonomie Niveau
              </label>
              <div className="relative">
                <select
                  className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[1.05rem] text-slate-950 outline-none"
                  onChange={(event) => setSelectedBloom(event.target.value)}
                  value={selectedBloom}
                >
                  {bloomOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[1.05rem] text-slate-500">
                Huidig niveau van {student.name}: {student.status}
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-[1.05rem] font-semibold text-slate-950">
                Specifiek Focusgebied (optioneel)
              </label>
              <input
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[1.05rem] text-slate-950 outline-none placeholder:text-slate-400"
                onChange={(event) => setFocusArea(event.target.value)}
                placeholder="Bijv. onderzoeken"
                value={focusArea}
              />
              <p className="text-[1.05rem] text-slate-500">
                Laat leeg voor een willekeurige interesse van de leerling
              </p>
            </div>

            <div className="space-y-4">
              <button
                className="flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 text-[1.15rem] font-semibold text-white shadow-[0_16px_28px_rgba(98,101,255,0.22)] transition hover:from-violet-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={searching || generating}
                onClick={searchSources}
                type="button"
              >
                {searching ? <Loader2 className="size-5 animate-spin" /> : <Brain className="size-5" />}
                Zoek Bronnen met AI
              </button>
              <button
                className="flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 text-[1.15rem] font-semibold text-white shadow-[0_16px_28px_rgba(98,101,255,0.22)] transition hover:from-violet-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={searching || generating}
                onClick={generateAssignment}
                type="button"
              >
                {generating ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Sparkles className="size-5" />
                )}
                Genereer Opdracht met AI
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
              AI-Criteria voor Opdracht Generatie
            </h2>
          </div>

          <p className="text-[1.1rem] leading-8 text-slate-700">
            De AI gebruikt de volgende criteria om een passende opdracht te genereren voor{" "}
            {student.name}:
          </p>

          <div className="space-y-4">
            <CriteriaRow
              description="Opdracht sluit aan bij wat de leerling motiveert"
              label="Leerling Interesse"
              value={focusArea || student.interests[0] || "Algemene verdieping"}
            />
            <CriteriaRow
              description={`Past bij huidig niveau (${selectedBloom}) of daagt uit naar hoger niveau`}
              label="Bloom Niveau"
              value={selectedBloom}
            />
            <CriteriaRow
              description="Opdracht is aangepast aan de voorkeurs-leerstijl"
              label="Leerstijl"
              value={student.learningStyle}
            />
            <CriteriaRow
              description="Opdracht kan op de gewenste manier uitgevoerd worden"
              label="Werkmethode"
              value={student.workMethod}
            />
            <CriteriaRow
              description="Omvang opdracht past bij concentratievermogen"
              label="Concentratieboog"
              value={student.concentration}
            />
          </div>

          <div className="rounded-[18px] bg-sky-50 px-5 py-4 text-[1.03rem] leading-7 text-slate-700">
            <span className="font-semibold text-slate-900">Leraar Regie:</span> U behoudt
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
              Snelle Didactische Tips voor {student.name}
            </h2>
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

      <SectionCard className="border-emerald-200 bg-[linear-gradient(180deg,rgba(251,255,253,0.96),rgba(244,255,248,0.92))]">
        <div className="space-y-7">
          <div className="flex items-center gap-3">
            <Cylinder className="size-6 text-emerald-600" />
            <h2 className="text-[1.15rem] font-semibold text-slate-950">
              RAG Proces - Retrieval-Augmented Generation
            </h2>
          </div>

          <p className="text-[1.1rem] leading-8 text-slate-700">
            Het AI-systeem gebruikt bestaande onderwijsmaterialen uit het OPP en leerlingcontext
            uit de database om nieuwe, gepersonaliseerde opdrachten te genereren.
          </p>

          <div className="space-y-5">
            <RagStep
              description="AI zoekt relevante OPP-passages en context in de database"
              icon={<Search className="size-7" />}
              title="1. Zoeken (Retrieval)"
            />
            <RagStep
              description="Gevonden context wordt verrijkt met leerlingprofiel en Bloom-niveau"
              icon={<Database className="size-7" />}
              title="2. Context Verrijken (Augmented)"
            />
            <RagStep
              description="Qwen genereert daarna een nieuwe opdracht op basis van de gevonden bronnen"
              icon={<Sparkles className="size-7" />}
              title="3. Genereren (Generation)"
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
            <span className="font-semibold text-slate-900">Transparantie:</span> Alle
            gegenereerde opdrachten zijn gebaseerd op geverifieerde onderwijsmaterialen uit de
            database. Bronnen worden altijd vermeld.
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

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
              <label
                className="block text-sm font-semibold text-slate-900"
                htmlFor="teacher-prompt"
              >
                Aanpassen met instructie
              </label>
              <textarea
                className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400"
                id="teacher-prompt"
                onChange={(event) => setTeacherPrompt(event.target.value)}
                placeholder="Bijvoorbeeld: maak de opdracht korter, voeg een creatief onderdeel toe of laat haar werken met actuele bronnen."
                value={teacherPrompt}
              />
              <p className="text-xs leading-6 text-slate-500">
                Deze instructie wordt gebruikt om de huidige opdracht gericht aan te passen.
              </p>
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
                  onChange={(event) => setRejectReason(event.target.value)}
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
                  disabled={revising || approving || !teacherPrompt.trim()}
                  onClick={reviseAssignment}
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
