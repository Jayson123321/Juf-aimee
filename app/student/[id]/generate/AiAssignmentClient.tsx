"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Check,
  Brain,
  BookOpen,
  CheckCircle2,
  Clock,
  Cylinder,
  Database,
  FileText,
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
  ImageIcon,
  User,
} from "lucide-react";
import type { PrototypeBloomLevel, PrototypeStudent } from "@/lib/prototype-runtime";

// ─── Types ────────────────────────────────────────────────────────────────────

type InteractiveMcContent = {
  question: string;
  options: string[];
  correctIndex: number;
  hints: string[];
  explanation: string;
};

type GeneratedAssignment = {
  title: string;
  assignment: string;
  rationale: string;
  sources: string[];
  interactiveContent?: InteractiveMcContent;
};

type GeneratedAssignmentImage = {
  imageUrl: string;
  prompt: string;
  durationMs: number;
  estimatedSeconds: number;
  modelFamilyUsed?: string;
  modelLabelUsed?: string;
};

type AssignmentMode = "text" | "mc" | "game";

type GameResult = {
  title: string;
  gameHtml: string;
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
  beslissing: "goedkeuren" | "flaggen" | "opnieuw_genereren";
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

const DEFAULT_IMAGE_WAIT_SECONDS = 70;

function getImageModelLabel(image: GeneratedAssignmentImage | null) {
  if (!image) return "";
  return image.modelLabelUsed || image.modelFamilyUsed?.toUpperCase() || "";
}

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
  const [mode, setMode] = useState<AssignmentMode>("text");
  
  const [includeIllustration, setIncludeIllustration] = useState(false);

  const isOpenFocus = (OPEN_FOCUS_OPTIONS as readonly string[]).includes(focusArea);
  const resolvedFocusArea = isOpenFocus && customFocusArea.trim()
    ? customFocusArea.trim()
    : focusArea || selectedVak;

  // Status
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [revising, setRevising] = useState(false);
  const [approving, setApproving] = useState(false);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [imageGenerating, setImageGenerating] = useState(false);
  const [mcStage, setMcStage] = useState<"idle" | "planner" | "coder" | "done">("idle");
  const [generationStep, setGenerationStep] = useState(0);
  const [error, setError] = useState("");
  const [approvalMessage, setApprovalMessage] = useState("");
  const [imageError, setImageError] = useState("");

  // Resultaten
  const [sources, setSources] = useState<string[]>([]);
  const [assignment, setAssignment] = useState<GeneratedAssignment | null>(null);
  const [assignmentImage, setAssignmentImage] = useState<GeneratedAssignmentImage | null>(null);
  const [imagePromptDraft, setImagePromptDraft] = useState("");
  const [imageElapsedMs, setImageElapsedMs] = useState(0);

  // Judge (streaming per criterium)
  const [judging, setJudging] = useState(false);
  const [judgeSteps, setJudgeSteps] = useState<CriteriumScore[]>([]);
  const [judgeTotal, setJudgeTotal] = useState(0);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [poging, setPoging] = useState(0);

  // Na goedkeuring
  const [savedAssignmentId, setSavedAssignmentId] = useState<string | null>(null);
  const [teacherFeedback, setTeacherFeedback] = useState("");
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  // Game
  const [gameGenerating, setGameGenerating] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [gamePhase, setGamePhase] = useState<"idle" | "building" | "playing">("idle");
  const [gameCodeDisplay, setGameCodeDisplay] = useState("");

  // RAS sectie
  const [rasText, setRasText] = useState("");
  const [rasGenerating, setRasGenerating] = useState(false);
  const [rasError, setRasError] = useState("");
  const [rasSteps, setRasSteps] = useState<("idle" | "running" | "done")[]>(
    ["idle", "idle", "idle", "idle", "idle"],
  );
  const [rasSaving, setRasSaving] = useState(false);
  const [rasSavedId, setRasSavedId] = useState<string | null>(null);
  const [rasFeedback, setRasFeedback] = useState("");
  const [rasFeedbackSaving, setRasFeedbackSaving] = useState(false);
  const [rasFeedbackSaved, setRasFeedbackSaved] = useState(false);

  // Leerkrachtsinteractie
  const [teacherPrompt, setTeacherPrompt] = useState("");
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectedAndReady, setRejectedAndReady] = useState(false);
  const [thinkingContent, setThinkingContent] = useState<string | null>(null);
  const [thinkingOpen, setThinkingOpen] = useState(false);
  const [suggestedNextBloom] = useState<string | null>(null);

  useEffect(() => {
    if (!imageGenerating) {
      setImageElapsedMs(0);
      return;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setImageElapsedMs(Date.now() - startedAt);
    }, 500);

    return () => window.clearInterval(timer);
  }, [imageGenerating]);

  function resetImageState() {
    setAssignmentImage(null);
    setImagePromptDraft("");
    setImageError("");
    setImageElapsedMs(0);
  }

  // ── API-hulpfuncties ─────────────────────────────────────────────────────────

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

  async function streamApi(
    body: Record<string, unknown>,
    onEvent: (event: { type: string; data: unknown }) => void,
  ) {
    const response = await fetch("/api/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok || !response.body) {
      const data = await response.json().catch(() => ({}));
      throw new Error((data as { error?: string }).error ?? "Stream mislukt.");
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
          onEvent(JSON.parse(trimmed) as { type: string; data: unknown });
        } catch (err) {
          if (!(err instanceof SyntaxError)) throw err;
        }
      }
    }
  }

  // ── Bronnen zoeken ───────────────────────────────────────────────────────────

  async function generateIllustration(
    targetAssignment: GeneratedAssignment,
    options: { promptOverride?: string; previousImageUrl?: string | null } = {},
  ) {
    setImageGenerating(true);
    setImageError("");

    try {
      const data = await callApi({
        action: "generate_image",
        studentId: student.id,
        focusArea: resolvedFocusArea,
        bloomLevel: selectedBloom,
        currentAssignment: targetAssignment,
        imagePrompt: options.promptOverride,
        previousImageUrl: options.previousImageUrl,
      });

      const generated = data as GeneratedAssignmentImage;
      setAssignmentImage(generated);
      setImagePromptDraft(generated.prompt);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Afbeelding genereren mislukt.");
    } finally {
      setImageGenerating(false);
    }
  }

  async function runJudge(targetAssignment: GeneratedAssignment) {
    setJudgeResult(null);
    setJudgeSteps([]);
    setJudgeTotal(0);
    setJudging(false);

    try {
      await streamApi(
        {
          action: "judge",
          studentId: student.id,
          focusArea: resolvedFocusArea,
          bloomLevel: selectedBloom,
          currentAssignment: targetAssignment,
        },
        (event) => {
          if (event.type === "judge_start") {
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
        },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Beoordeling mislukt.");
      setJudging(false);
    }
  }

  async function searchSources() {
    setSearching(true);
    setError("");
    setApprovalMessage("");
    try {
      const data = await callApi({
        action: "search",
        studentId: student.id,
        focusArea: resolvedFocusArea,
        bloomLevel: selectedBloom,
      });
      setSources((data as { sources?: string[] }).sources ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bronnen zoeken mislukt.");
    } finally {
      setSearching(false);
    }
  }

  // ── Tekstopdracht genereren / aanpassen (streaming met judge) ────────────────

  async function runGenerateStream(action: "generate" | "revise") {
    const setLoading = action === "generate" ? setGenerating : setRevising;
    const previousImageUrlForRevision = action === "revise" ? assignmentImage?.imageUrl ?? null : null;
    let latestAssignment: GeneratedAssignment | null = null;

    setLoading(true);
    setError("");
    setApprovalMessage("");
    setImageError("");
    setJudgeResult(null);
    setJudgeSteps([]);
    setJudgeTotal(0);
    setJudging(false);
    setPoging(0);
    setSavedAssignmentId(null);
    setFeedbackSaved(false);
    if (action === "generate" || !includeIllustration) {
      resetImageState();
    }

    try {
      await streamApi(
        {
          action,
          studentId: student.id,
          focusArea: resolvedFocusArea,
          bloomLevel: selectedBloom,
          estimatedTime,
          teacherPrompt: action === "revise" ? teacherPrompt : undefined,
          currentAssignment: action === "revise" ? assignment : undefined,
        },
        (event) => {
          if (event.type === "step") {
            setGenerationStep(event.data as number);
          } else if (event.type === "sources") {
            setSources(event.data as string[]);
          } else if (event.type === "thinking") {
            setThinkingContent((event.data as { content: string }).content);
            setThinkingOpen(true);
          } else if (event.type === "assignment") {
            latestAssignment = event.data as GeneratedAssignment;
            setAssignment(latestAssignment);
            setTeacherPrompt("");
            setJudgeResult(null);
            setJudgeSteps([]);
            setPoging((prev) => prev + 1);
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
        },
      );

      if (latestAssignment && includeIllustration) {
        await generateIllustration(latestAssignment, {
          previousImageUrl: previousImageUrlForRevision,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opdracht genereren mislukt.");
    } finally {
      setJudging(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (gamePhase !== "building" || !gameResult) return;

    let index = 0;
    const fullCode = gameResult.gameHtml;
    const CHUNK = 40;

    const timer = window.setInterval(() => {
      index += CHUNK;
      setGameCodeDisplay(fullCode.slice(0, index));
      if (index >= fullCode.length) {
        clearInterval(timer);
        setGameCodeDisplay(fullCode);
        setGamePhase("playing");
      }
    }, 25);

    return () => clearInterval(timer);
  }, [gamePhase, gameResult]);

  async function runGenerateGame() {
    setGameGenerating(true);
    setGameResult(null);
    setGamePhase("idle");
    setGameCodeDisplay("");
    setError("");

    try {
      const data = await callApi({
        action: "generate_game",
        studentId: student.id,
        focusArea: resolvedFocusArea,
        bloomLevel: selectedBloom,
        estimatedTime,
        teacherPrompt,
      });

      const result = data as GameResult;
      setGameResult(result);
      setGamePhase("building");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Spel genereren mislukt.");
    } finally {
      setGameGenerating(false);
    }
  }

  // ── Meerkeuzevraag genereren (streaming Planner → Coder) ─────────────────────

  async function runGenerateMcStream() {
    let latestAssignment: GeneratedAssignment | null = null;

    setGenerating(true);
    setError("");
    setApprovalMessage("");
    setImageError("");
    setAssignment(null);
    setJudgeResult(null);
    setJudgeSteps([]);
    setJudgeTotal(0);
    setJudging(false);
    setMcStage("planner");
    setSavedAssignmentId(null);
    setFeedbackSaved(false);
    resetImageState();

    try {
      await streamApi(
        {
          action: "generate_mc",
          studentId: student.id,
          focusArea: resolvedFocusArea,
          bloomLevel: selectedBloom,
          estimatedTime,
        },
        (event) => {
          if (event.type === "sources") {
            setSources(event.data as string[]);
          } else if (event.type === "stage") {
            const { stage, status } = event.data as { stage: "planner" | "coder"; status: "running" | "done" };
            if (status === "running") setMcStage(stage);
          } else if (event.type === "mc_question") {
            latestAssignment = event.data as GeneratedAssignment;
            setAssignment(latestAssignment);
            setMcStage("done");
          } else if (event.type === "error") {
            throw new Error((event.data as { message: string }).message);
          }
        },
      );

      if (latestAssignment) {
        if (includeIllustration) {
          await generateIllustration(latestAssignment);
        }

        await runJudge(latestAssignment);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Meerkeuzevraag genereren mislukt.");
      setMcStage("idle");
    } finally {
      setGenerating(false);
    }
  }

  async function runRasStream() {
    setRasGenerating(true);
    setRasError("");
    setRasText("");
    setRasSteps(["idle", "idle", "idle", "idle", "idle"]);
    setRasSavedId(null);
    setRasFeedback("");
    setRasFeedbackSaved(false);

    try {
      await streamApi(
        {
          action: "generate_ras",
          studentId: student.id,
          focusArea: resolvedFocusArea,
          bloomLevel: selectedBloom,
          vak: selectedVak,
          estimatedTime,
        },
        (event) => {
          if (event.type === "ras_step") {
            const { stage, status } = event.data as { stage: number; status: "running" | "done" };
            setRasSteps((prev) => {
              const next = [...prev];
              next[stage - 1] = status;
              return next;
            });
          } else if (event.type === "chunk") {
            setRasText((prev) => prev + (event.data as string));
          } else if (event.type === "error") {
            throw new Error((event.data as { message: string }).message);
          }
        },
      );
    } catch (err) {
      setRasError(err instanceof Error ? err.message : "RAS genereren mislukt.");
    } finally {
      setRasGenerating(false);
    }
  }

  async function saveRasAssignment() {
    const text = rasText.trim();
    if (!text) return;

    const lines = text.split("\n");
    const firstNonEmpty = lines.findIndex((l) => l.trim().length > 0);
    const rawTitle = firstNonEmpty >= 0 ? lines[firstNonEmpty] : "RAS-opdracht";
    const title = rawTitle.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim().slice(0, 200) || "RAS-opdracht";
    const fullBody = lines.slice(firstNonEmpty + 1).join("\n").trim() || text;

    const rationaleMatch = fullBody.match(/(^|\n)\s*\**\s*RATIONALE\s*\**\s*:?\s*\n?/i);
    const rationaleIdx = rationaleMatch?.index ?? -1;
    const studentBody = rationaleIdx >= 0 ? fullBody.slice(0, rationaleIdx).trim() : fullBody;
    const rationaleText = rationaleIdx >= 0
      ? fullBody.slice(rationaleIdx + (rationaleMatch?.[0].length ?? 0)).trim()
      : "";

    setRasSaving(true);
    setRasError("");
    try {
      const data = await callApi({
        action: "approve",
        studentId: student.id,
        focusArea: resolvedFocusArea,
        bloomLevel: selectedBloom,
        currentAssignment: {
          title,
          assignment: studentBody,
          rationale: rationaleText || "Gegenereerd door RAS-pijplijn",
          sources: [],
        },
      });
      setRasSavedId((data as { savedAssignmentId?: string }).savedAssignmentId ?? null);
      setRasFeedback("");
      setRasFeedbackSaved(false);
    } catch (err) {
      setRasError(err instanceof Error ? err.message : "Opdracht opslaan mislukt.");
    } finally {
      setRasSaving(false);
    }
  }

  async function saveRasFeedback() {
    if (!rasSavedId || !rasFeedback.trim()) return;
    setRasFeedbackSaving(true);
    try {
      await callApi({
        action: "feedback",
        studentId: student.id,
        assignmentId: rasSavedId,
        feedback: rasFeedback.trim(),
      });
      setRasFeedbackSaved(true);
    } catch (err) {
      setRasError(err instanceof Error ? err.message : "Feedback opslaan mislukt.");
    } finally {
      setRasFeedbackSaving(false);
    }
  }

  // ── Goedkeuren ───────────────────────────────────────────────────────────────

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
        estimatedTime,
        currentAssignment: {
          ...assignment,
          illustrationUrl: assignmentImage?.imageUrl,
          illustrationPrompt: assignmentImage?.prompt,
        },
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

  // ── Feedback na uitvoering ──────────────────────────────────────────────────

  async function saveFeedback() {
    if (!savedAssignmentId || !teacherFeedback.trim()) return;
    setSavingFeedback(true);
    try {
      await callApi({
        action: "feedback",
        studentId: student.id,
        assignmentId: savedAssignmentId,
        feedback: teacherFeedback.trim(),
      });
      setFeedbackSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Feedback opslaan mislukt.");
    } finally {
      setSavingFeedback(false);
    }
  }

  // ── Afkeuren ─────────────────────────────────────────────────────────────────

  async function rejectAssignment() {
    if (assignment) {
      try {
        await callApi({
          action: "reject",
          studentId: student.id,
          rejectReason,
          assignmentTitle: assignment.title,
        });
      } catch {
        // Doorgaan ook als opslaan mislukt
      }
    }
    setAssignment(null);
    setJudgeResult(null);
    setJudgeSteps([]);
    setTeacherPrompt(rejectReason);
    setApprovalMessage("");
    setError("");
    resetImageState();
    setRejectMode(false);
    setRejectReason("");
    setRejectedAndReady(true);
  }

  function generateAfterReject() {
    setRejectedAndReady(false);
    if (mode === "mc") runGenerateMcStream();
    else runGenerateStream("generate");
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const mc = assignment?.interactiveContent ?? null;
  const busy = searching || generating || revising || approving || imageGenerating || judging;
  const imageEstimateSeconds = assignmentImage?.estimatedSeconds ?? DEFAULT_IMAGE_WAIT_SECONDS;
  const imageProgress = Math.min(96, Math.round((imageElapsedMs / (imageEstimateSeconds * 1000)) * 100));

  return (
    <div className="space-y-8">

      {/* Instellingen + knoppen */}
      <SectionCard className="border-violet-200 bg-[linear-gradient(180deg,rgba(253,252,255,0.97),rgba(248,246,255,0.93))]">
        <div className="space-y-8">
          <div className="relative -mx-8 -mt-8 flex items-center gap-4 overflow-hidden rounded-t-[28px] bg-gradient-to-br from-violet-600 via-blue-600 to-blue-500 px-8 py-7 text-white">
            <div className="pointer-events-none absolute -right-6 -top-8 size-28 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 left-1/3 size-24 rounded-full bg-fuchsia-400/25 blur-2xl" />
            <div className="relative flex size-14 items-center justify-center rounded-2xl bg-white/15 shadow-inner ring-1 ring-white/20">
              <Sparkles className="size-8" />
            </div>
            <div className="relative">
              <h1 className="text-[2rem] font-bold tracking-tight">AI Opdracht Genereren</h1>
              <p className="text-[1.1rem] text-white/85">Voor {student.name}</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-3xl bg-gradient-to-r from-violet-100 to-blue-100 px-8 py-7 ring-1 ring-violet-200/70">
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
              <label className="block text-[1.05rem] font-semibold text-slate-950">
                Bloom&apos;s Taxonomie Niveau
              </label>
              <div className="relative">
                <select
                  className="h-12 w-full appearance-none rounded-2xl border border-violet-200 bg-violet-50/70 px-4 text-[1.05rem] text-slate-950 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
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
              {suggestedNextBloom && suggestedNextBloom !== selectedBloom && (
                <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">Aanbeveling:</span> Op basis van eerdere opdrachten is <span className="font-semibold">{suggestedNextBloom}</span> het volgende passende niveau voor {student.name}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedBloom(suggestedNextBloom)}
                    className="ml-4 shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-600"
                  >
                    Gebruik dit niveau
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-[1.05rem] font-semibold text-slate-950" htmlFor="vak-select">Schoolvak</label>
              <select
                className="h-12 w-full appearance-none rounded-2xl border border-violet-200 bg-violet-50/70 px-4 text-[1.05rem] text-slate-950 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
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
                className="h-12 w-full appearance-none rounded-2xl border border-violet-200 bg-violet-50/70 px-4 text-[1.05rem] text-slate-950 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
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
                className="h-12 w-full appearance-none rounded-2xl border border-violet-200 bg-violet-50/70 px-4 text-[1.05rem] text-slate-950 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
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

            <div className="space-y-3">
              <label className="block text-[1.05rem] font-semibold text-slate-950">Type opdracht</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  className={`flex h-14 items-center justify-center gap-2 rounded-2xl border-2 text-[1rem] font-semibold transition ${
                    mode === "text"
                      ? "border-violet-500 bg-violet-50 text-violet-900 shadow-[0_8px_20px_rgba(109,77,200,0.15)]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                  onClick={() => setMode("text")}
                  type="button"
                >
                  <FileText className="size-4" />
                  Tekstopdracht
                </button>
                <button
                  className={`flex h-14 items-center justify-center gap-2 rounded-2xl border-2 text-[1rem] font-semibold transition ${
                    mode === "mc"
                      ? "border-violet-500 bg-violet-50 text-violet-900 shadow-[0_8px_20px_rgba(109,77,200,0.15)]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                  onClick={() => setMode("mc")}
                  type="button"
                >
                  <Check className="size-4" />
                  Interactieve meerkeuze
                </button>
                <button
                  className={`flex h-14 items-center justify-center gap-2 rounded-2xl border-2 text-[1rem] font-semibold transition ${
                    mode === "game"
                      ? "border-violet-500 bg-violet-50 text-violet-900 shadow-[0_8px_20px_rgba(109,77,200,0.15)]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                  onClick={() => setMode("game")}
                  type="button"
                >
                  <Check className="size-4" />
                  Interactieve spel 
                </button>
              </div>
              <p className="text-[0.95rem] text-slate-500">
                {mode === "text"
                  ? "Klassieke open-tekstopdracht waarbij de leerling zelf antwoordt."
                  : "Twee AI-modellen werken samen: de Planner verzint de vraag, de Coder maakt er een gevalideerde meerkeuzevraag van."}
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-[1.05rem] font-semibold text-slate-950">Visuele ondersteuning</label>
              <label className="flex items-start gap-4 rounded-3xl border border-violet-200 bg-violet-50/60 px-5 py-4">
                <input
                  checked={includeIllustration}
                  className="mt-1 size-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIncludeIllustration(checked);
                    if (!checked) {
                      resetImageState();
                    }
                  }}
                  type="checkbox"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-950">
                    <ImageIcon className="size-4 text-violet-500" />
                    <span className="font-semibold">Bouw er automatisch een afbeelding bij</span>
                  </div>
                  <p className="text-[0.98rem] leading-7 text-slate-600">
                    Nadat de vraag of opdracht klaar is, maakt Juf Aimee een ondersteunende illustratie die later ook op het leerlingscherm wordt getoond.
                  </p>
                </div>
              </label>
            </div>

            <div className="space-y-4">
              <button
                className="flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-[1.15rem] font-semibold text-white shadow-[0_16px_28px_rgba(14,165,233,0.22)] transition hover:from-sky-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={busy}
                onClick={searchSources}
                type="button"
              >
                <span className="flex shrink-0">{searching ? <Loader2 className="size-5 animate-spin" /> : <Search className="size-5" />}</span>
                <span>Zoek Bronnen met AI</span>
              </button>
              {rejectedAndReady ? (
                <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
                  <p className="text-sm font-semibold text-rose-800">
                    Opdracht afgekeurd — reden is opgeslagen. Genereer een nieuwe opdracht op basis van je feedback.
                  </p>
                  <button
                    className="flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-500 to-violet-500 text-[1.15rem] font-semibold text-white shadow-[0_16px_28px_rgba(200,80,80,0.18)] transition hover:from-rose-600 hover:to-violet-600 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={busy}
                    onClick={generateAfterReject}
                    type="button"
                  >
                    {generating ? <Loader2 className="size-5 animate-spin" /> : <RotateCcw className="size-5" />}
                    Genereer nieuwe opdracht
                  </button>
                </div>
              ) : mode === "text" ? (
                <button
                  className="flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 text-[1.15rem] font-semibold text-white shadow-[0_16px_28px_rgba(98,101,255,0.22)] transition hover:from-violet-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={busy}
                  onClick={() => runGenerateStream("generate")}
                  type="button"
                >
                  <span className="flex shrink-0">{generating ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}</span>
                  <span>Genereer Opdracht met AI</span>
                </button>
              ) : mode === "game" ? (
                <button
                  className="flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 text-[1.15rem] font-semibold text-white shadow-[0_16px_28px_rgba(98,101,255,0.22)] transition hover:from-violet-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={busy || gameGenerating}
                  onClick={runGenerateGame}
                  type="button"
                >
                  <span className="flex shrink-0">{gameGenerating ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}</span>
                  <span>{gameGenerating ? "Spel wordt gebouwd..." : "Genereer Spel met AI"}</span>
                </button>
              ) : (
                <button
                  className="flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 text-[1.15rem] font-semibold text-white shadow-[0_16px_28px_rgba(98,101,255,0.22)] transition hover:from-violet-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={busy}
                  onClick={runGenerateMcStream}
                  type="button"
                >
                  <span className="flex shrink-0">{generating ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}</span>
                  <span>Genereer Meerkeuzevraag met AI</span>
                </button>
               ) 
                }
              {mode === "mc" && mcStage !== "idle" && mcStage !== "done" && (
                <div className="flex items-center gap-3 rounded-2xl bg-violet-50 px-4 py-3 text-sm text-violet-800">
                  <Loader2 className="size-4 animate-spin" />
                  <span>
                    {mcStage === "planner"
                      ? "De Planner bedenkt de vraag op basis van het leerlingprofiel..."
                      : "De Coder valideert en normaliseert de meerkeuzevraag..."}
                  </span>
                </div>
              )}
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

            {poging >= 2 && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                <RotateCcw className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <span>
                  <span className="font-semibold">Automatisch opnieuw gegenereerd</span> — de eerste versie scoorde te laag op de kwaliteitscheck. Dit is poging 2 van 2, met verbeterpunten uit de eerste beoordeling.
                </span>
              </div>
            )}

            {thinkingContent && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50">
                <button
                  className="flex w-full items-center justify-between px-5 py-3 text-left"
                  onClick={() => setThinkingOpen((o) => !o)}
                  type="button"
                >
                  <span className="text-xs font-semibold uppercase tracking-widest text-amber-700">
                    🧠 Redenering van de AI
                  </span>
                  <span className="text-xs text-amber-600">{thinkingOpen ? "Verberg" : "Toon"}</span>
                </button>
                {thinkingOpen && (
                  <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap px-5 pb-4 text-xs leading-6 text-amber-900">
                    {thinkingContent}
                  </pre>
                )}
              </div>
            )}

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
                <p className="text-sm font-semibold uppercase tracking-wide">
                  {mc ? "De vraag" : "Opdrachtbeschrijving"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-[1.06rem] leading-8 text-slate-800 shadow-[0_4px_12px_rgba(15,23,42,0.04)] whitespace-pre-wrap">
                {assignment.assignment}
              </div>
            </div>

            {includeIllustration && (
              <div className="space-y-4 rounded-3xl border border-blue-100 bg-[linear-gradient(180deg,rgba(247,251,255,0.96),rgba(240,247,255,0.92))] px-6 py-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <ImageIcon className="size-4 shrink-0" />
                    <p className="text-sm font-semibold uppercase tracking-wide">Ondersteunende afbeelding</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {assignmentImage?.modelLabelUsed && !imageGenerating && (
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        Model: {getImageModelLabel(assignmentImage)}
                      </span>
                    )}
                    {assignmentImage && !imageGenerating && (
                      <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700">
                        Klaar in {Math.max(1, Math.round(assignmentImage.durationMs / 1000))} sec
                      </span>
                    )}
                  </div>
                </div>

                {assignmentImage ? (
                  <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[0_10px_30px_rgba(59,130,246,0.08)]">
                    <Image
                      alt={`Illustratie bij ${assignment.title}`}
                      className="h-auto w-full object-cover"
                      src={assignmentImage.imageUrl}
                      height={900}
                      unoptimized
                      width={1400}
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-white/80 px-5 py-8 text-center text-sm text-slate-500">
                    Er is nog geen afbeelding gemaakt voor deze opdracht.
                  </div>
                )}

                {imageGenerating && (
                  <div className="space-y-3 rounded-2xl border border-blue-200 bg-white px-5 py-4">
                    <div className="flex items-center gap-3 text-sm font-medium text-blue-900">
                      <Loader2 className="size-4 animate-spin" />
                      Afbeelding wordt gemaakt. Reken op ongeveer {imageEstimateSeconds} seconden.
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-blue-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${imageProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Bezig sinds {Math.max(1, Math.round(imageElapsedMs / 1000))} sec. Je kunt de opdracht zo meteen opnieuw prompten als je iets wilt aanpassen.
                    </p>
                  </div>
                )}

                {imageError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {imageError}
                  </div>
                )}

                <div className="space-y-3 rounded-2xl border border-blue-100 bg-white px-5 py-5">
                  <label className="block text-sm font-semibold text-slate-900" htmlFor="image-prompt">
                    Afbeelding aanpassen met een nieuwe prompt
                  </label>
                  <textarea
                    className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400"
                    id="image-prompt"
                    onChange={(e) => setImagePromptDraft(e.target.value)}
                    placeholder="Bijvoorbeeld: maak het beeld speelser, voeg een laboratorium toe of laat minder details zien."
                    value={imagePromptDraft}
                  />
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={imageGenerating}
                      onClick={() =>
                        generateIllustration(assignment, {
                          promptOverride: imagePromptDraft.trim() || undefined,
                          previousImageUrl: assignmentImage?.imageUrl ?? null,
                        })
                      }
                      type="button"
                    >
                      {imageGenerating ? <Loader2 className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
                      {assignmentImage ? "Afbeelding opnieuw maken" : "Afbeelding maken"}
                    </button>
                    {!assignmentImage && !imageGenerating && (
                      <p className="text-sm text-slate-500">
                        De afbeelding wordt automatisch gemaakt als dit vakje aan stond tijdens genereren. Je kunt hem hier ook handmatig starten.
                      </p>
                    )}
                    {assignmentImage && (
                      <p className="text-sm text-slate-500">
                        Op 24GB VRAM gebruiken we standaard hetzelfde stabiele beeldmodel voor de eerste render en voor opnieuw maken.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {mc && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-violet-700">
                  <Check className="size-4 shrink-0" />
                  <p className="text-sm font-semibold uppercase tracking-wide">Antwoordopties</p>
                </div>
                <div className="space-y-2">
                  {mc.options.map((option, idx) => {
                    const isCorrect = idx === mc.correctIndex;
                    return (
                      <div
                        className={`flex items-start gap-3 rounded-2xl border px-5 py-3 text-[1.02rem] leading-7 ${
                          isCorrect
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                            : "border-slate-200 bg-white text-slate-700"
                        }`}
                        key={idx}
                      >
                        <span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isCorrect ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {isCorrect && (
                          <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Juist</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/60 px-5 py-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">Hints</p>
                    <ol className="list-decimal space-y-1 pl-5 text-[0.98rem] leading-7 text-slate-700">
                      {mc.hints.map((hint, i) => <li key={i}>{hint}</li>)}
                    </ol>
                  </div>
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">Uitleg</p>
                    <p className="text-[0.98rem] leading-7 text-slate-700">{mc.explanation}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-violet-700">
                <Brain className="size-4 shrink-0" />
                <p className="text-sm font-semibold uppercase tracking-wide">Onderbouwing</p>
              </div>
              <div className="rounded-2xl border border-violet-100 bg-violet-50 px-6 py-5">
                <p className="text-[1.04rem] leading-8 text-slate-700">{assignment.rationale}</p>
              </div>
            </div>

            {/* Judge — live streaming criteria (alleen voor tekst-flow) */}
            {!mc && (judging || judgeSteps.length > 0 || judgeResult) && (
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Scale className="size-4 text-violet-600" />
                    <p className="text-sm font-semibold text-slate-900">LLM-as-Judge beoordeling</p>
                  </div>
                  {judgeResult ? (
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      judgeResult.beslissing === "goedkeuren" ? "bg-emerald-100 text-emerald-800"
                      : judgeResult.beslissing === "flaggen" ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                    }`}>
                      {judgeResult.beslissing === "goedkeuren" ? "✓ Goedgekeurd"
                        : judgeResult.beslissing === "flaggen" ? "⚠ Menselijke review nodig"
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
                    <span className="text-xs text-slate-500">{judgeSteps.length}/{judgeTotal}</span>
                  </div>
                )}

                {judgeResult && (
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
                )}

                <div className="space-y-2">
                  {judgeSteps.map((s) => (
                    <div key={s.criterium} className="animate-in fade-in slide-in-from-bottom-1 rounded-xl bg-white px-4 py-3 ring-1 ring-slate-100 duration-300">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-700">C{s.criterium}: {s.naam}</p>
                        <span className={`ml-2 shrink-0 text-xs font-bold ${
                          s.score >= 4 ? "text-emerald-600" : s.score >= 3 ? "text-amber-600" : "text-rose-600"
                        }`}>{s.score}/5</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{s.feedback}</p>
                    </div>
                  ))}
                  {judging && judgeSteps.length < judgeTotal && (
                    <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 ring-1 ring-slate-100">
                      <Loader2 className="size-3 shrink-0 animate-spin text-violet-500" />
                      <p className="text-xs text-slate-500">Criterium {judgeSteps.length + 1} wordt beoordeeld...</p>
                    </div>
                  )}
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
                      <span className="flex shrink-0">{savingFeedback ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}</span>
                      <span>Feedback opslaan</span>
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

            {/* Aanpassen met instructie (alleen voor tekstopdrachten) */}
            {!mc && (
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
            )}

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
                {mc ? (
                  <button
                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={busy}
                    onClick={runGenerateMcStream}
                    type="button"
                  >
                    <span className="flex shrink-0">{generating ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}</span>
                    <span>Opnieuw genereren</span>
                  </button>
                ) : (
                  <button
                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={busy || !teacherPrompt.trim()}
                    onClick={() => runGenerateStream("revise")}
                    type="button"
                  >
                    <span className="flex shrink-0">{revising ? <Loader2 className="size-4 animate-spin" /> : <PencilLine className="size-4" />}</span>
                    <span>Aanpassen</span>
                  </button>
                )}
                <button
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={busy}
                  onClick={() => setRejectMode(true)}
                  type="button"
                >
                  <RotateCcw className="size-4" />
                  Afkeuren
                </button>
                <button
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={busy}
                  onClick={approveAssignment}
                  type="button"
                >
                  <span className="flex shrink-0">{approving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}</span>
                  <span>Goedkeuren &amp; opslaan</span>
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

      {/* RAS — uitgebreide opdracht */}
      <SectionCard className="border-blue-200 bg-[linear-gradient(180deg,rgba(248,252,255,0.97),rgba(240,249,255,0.93))]">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-[0_8px_20px_rgba(59,130,246,0.25)]">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="text-[1.15rem] font-semibold text-slate-950">RAS — Uitgebreide Opdracht</h2>
              <p className="text-sm text-slate-500">Genereert een lange, gedetailleerde opdracht speciaal voor hoogbegaafde leerlingen</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800">
              <BookOpen className="size-4" />
              {selectedVak}
            </span>
            {resolvedFocusArea && resolvedFocusArea !== selectedVak && (
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                <Target className="size-4" />
                {resolvedFocusArea}
              </span>
            )}
            <span className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
              {selectedBloom}
            </span>
          </div>

          <button
            className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-[1.05rem] font-semibold text-white shadow-[0_12px_24px_rgba(59,130,246,0.22)] transition hover:from-blue-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={busy || rasGenerating}
            onClick={runRasStream}
            type="button"
          >
            <span className="flex shrink-0">{rasGenerating ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}</span>
            <span>Genereer met RAS</span>
          </button>

          {rasError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{rasError}</div>
          )}

          {(rasGenerating || rasSteps.some((s) => s !== "idle")) && (() => {
            const GEMMA_STEPS = [
              { label: "Studentprofiel", icon: User },
              { label: "Leerkrachtfeedback", icon: MessageSquare },
              { label: "Reflecties", icon: Lightbulb },
              { label: "Eerdere opdrachten", icon: FileText },
              { label: "Genereren", icon: Sparkles },
            ] as const;
            const doneCount = rasSteps.filter((s) => s === "done").length;
            const runningCount = rasSteps.filter((s) => s === "running").length;
            const progressPct = ((doneCount + runningCount * 0.5) / GEMMA_STEPS.length) * 100;
            return (
              <div className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/40 px-5 py-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-blue-900">RAS-pijplijn</p>
                  <span className="text-xs font-medium text-blue-700">{doneCount}/{GEMMA_STEPS.length} stappen</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-blue-100">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-700 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {GEMMA_STEPS.map((step, idx) => {
                    const status = rasSteps[idx];
                    const Icon = step.icon;
                    return (
                      <div className="flex flex-col items-center gap-1.5 text-center" key={step.label}>
                        <div
                          className={`flex size-10 items-center justify-center rounded-full ring-2 transition ${
                            status === "done"
                              ? "bg-emerald-500 text-white ring-emerald-200"
                              : status === "running"
                              ? "animate-pulse bg-blue-500 text-white ring-blue-200"
                              : "bg-slate-100 text-slate-400 ring-slate-200"
                          }`}
                        >
                          {status === "done" ? <Check className="size-4" />
                            : status === "running" ? <Loader2 className="size-4 animate-spin" />
                            : <Icon className="size-4" />}
                        </div>
                        <p
                          className={`text-[0.7rem] leading-tight ${
                            status === "done" ? "font-semibold text-emerald-700"
                              : status === "running" ? "font-semibold text-blue-700"
                              : "text-slate-500"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {(rasGenerating || rasText) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-blue-600" />
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Gegenereerde opdracht</p>
                {rasGenerating && <Loader2 className="size-3 animate-spin text-blue-500" />}
              </div>
              <div className="min-h-[120px] rounded-2xl border border-blue-100 bg-white px-6 py-5 text-[1.02rem] leading-8 text-slate-800 shadow-[0_4px_12px_rgba(15,23,42,0.04)] whitespace-pre-wrap">
                {rasText || <span className="text-slate-400 italic">Opdracht wordt gegenereerd...</span>}
              </div>

              {rasText && !rasGenerating && (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={rasSaving || Boolean(rasSavedId)}
                    onClick={saveRasAssignment}
                    type="button"
                  >
                    <span className="flex shrink-0">
                      {rasSaving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                    </span>
                    <span>{rasSavedId ? "Opgeslagen" : "Opslaan voor leerling"}</span>
                  </button>
                  {rasSavedId && (
                    <span className="text-sm text-emerald-700">Opdracht opgeslagen voor {student.name}.</span>
                  )}
                </div>
              )}

              {rasSavedId && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <MessageSquare className="size-4 shrink-0" />
                    <p className="text-sm font-semibold uppercase tracking-wide">Feedback van de leraar</p>
                  </div>
                  {rasFeedbackSaved ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
                      <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                      <span>Feedback opgeslagen en wordt meegenomen in toekomstige opdrachten.</span>
                    </div>
                  ) : (
                    <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-5">
                      <p className="text-sm text-emerald-800">
                        Hoe is de opdracht verlopen? Deze feedback wordt opgeslagen en gebruikt bij het genereren van volgende opdrachten.
                      </p>
                      <textarea
                        className="min-h-[100px] w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400"
                        onChange={(e) => setRasFeedback(e.target.value)}
                        placeholder="Bijv. de leerling werkte enthousiast maar had moeite met de planning. Volgende keer meer structuur bieden."
                        value={rasFeedback}
                      />
                      <button
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={rasFeedbackSaving || !rasFeedback.trim()}
                        onClick={saveRasFeedback}
                        type="button"
                      >
                        <span className="flex shrink-0">{rasFeedbackSaving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}</span>
                        <span>Feedback opslaan</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Game builder */}
      {mode === "game" && (gameGenerating || gameResult) && (
        <SectionCard className="border-violet-200 bg-[linear-gradient(180deg,rgba(252,250,255,0.96),rgba(247,243,255,0.92))]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-[0_8px_20px_rgba(98,101,255,0.25)]">
                <Sparkles className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-500">AI Game Builder</p>
                <h2 className="text-[1.15rem] font-semibold text-slate-950">
                  {gameGenerating ? "AI programmeert het spel..." : gameResult?.title}
                </h2>
              </div>
            </div>

            {/* Fase 1: code stroomt binnen */}
            {(gameGenerating || gamePhase === "building") && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-violet-700">
                  <Loader2 className="size-4 animate-spin" />
                  <p className="text-sm font-semibold">
                    {gameGenerating ? "HTML, CSS en JavaScript worden gegenereerd..." : "Code laden..."}
                  </p>
                </div>
                <pre className="max-h-[420px] overflow-auto rounded-2xl bg-slate-950 p-5 text-xs leading-6 text-emerald-400 shadow-inner">
                  {gameCodeDisplay || " "}
                  <span className="animate-pulse">▌</span>
                </pre>
              </div>
            )}

            {/* Fase 2: spel speelbaar */}
            {gamePhase === "playing" && gameResult && (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-violet-200 shadow-[0_12px_30px_rgba(98,101,255,0.12)]">
                  <iframe
                    className="h-[600px] w-full"
                    sandbox="allow-scripts"
                    srcDoc={gameResult.gameHtml}
                    title={gameResult.title}
                  />
                </div>

                {gameResult.rationale && (
                  <details className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                    <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                      Pedagogische onderbouwing
                    </summary>
                    <p className="mt-3 text-sm leading-7 text-slate-600 whitespace-pre-wrap">
                      {gameResult.rationale}
                    </p>
                  </details>
                )}

                <button
                  className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-[1.05rem] font-semibold text-white shadow-md transition hover:from-emerald-600 hover:to-teal-600"
                  onClick={async () => {
                    await callApi({
                      action: "approve",
                      studentId: student.id,
                      currentAssignment: {
                        title: gameResult.title,
                        assignment: gameResult.gameHtml,
                        rationale: gameResult.rationale,
                      },
                      bloomLevel: selectedBloom,
                      focusArea: resolvedFocusArea,
                      estimatedTime,
                      assignmentType: "game",
                    });
                  }}
                  type="button"
                >
                  <Check className="size-5" />
                  Spel goedkeuren voor leerling
                </button>
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
