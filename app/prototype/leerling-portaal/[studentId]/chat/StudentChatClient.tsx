"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type StudentChatClientProps = {
  studentId: string;
  studentName: string;
  assignmentId?: string;
  assignmentTitle?: string;
  assignmentDescription?: string;
  assignmentType?: "TEXT" | "MULTIPLE_CHOICE";
  assignmentTip?: string | null;
  assignmentQuestion?: string | null;
  draftWork?: string;
  compact?: boolean;
};

export function StudentChatClient({
  studentId,
  studentName,
  assignmentId,
  assignmentTitle,
  assignmentDescription,
  assignmentType,
  assignmentTip,
  assignmentQuestion,
  draftWork = "",
  compact = false,
}: StudentChatClientProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingState, setLoadingState] = useState<"booting" | "sending" | "idle">("booting");
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const firstName = studentName.split(" ")[0];
  const quickPrompts = useMemo(
    () =>
      assignmentId
        ? ["Ik snap de opdracht niet", "Kun je een hint geven?", "Hoe begin ik?"]
        : ["Help met opdracht", "Vertel over Bloom", "Ik snap het niet"],
    [assignmentId],
  );

  function buildPayload(action: "init" | "message", content?: string) {
    return {
      action,
      studentId,
      message: content,
      assignmentId,
      assignmentTitle,
      assignmentDescription,
      assignmentType,
      assignmentTip,
      assignmentQuestion,
      draftWork,
      conversation: messages.slice(-8),
    };
  }

  useEffect(() => {
    fetch("/api/prototype/student-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload("init")),
    })
      .then((response) => response.json())
      .then((data) => {
        setMessages(
          data.messages ?? [
            {
              role: "assistant",
              content: `Hoi ${firstName}! Ik ben Juf Aimee. Waar wil je graag hulp bij?`,
            },
          ],
        );
        setLoadingState("idle");
      })
      .catch(() => {
        setMessages([
          {
            role: "assistant",
            content: `Hoi ${firstName}! Ik ben Juf Aimee. Waar wil je graag hulp bij?`,
          },
        ]);
        setLoadingState("idle");
      });
  }, [
    assignmentDescription,
    assignmentId,
    assignmentQuestion,
    assignmentTip,
    assignmentTitle,
    assignmentType,
    firstName,
    studentId,
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingState]);

  async function sendMessage(prefill?: string) {
    const content = (prefill ?? input).trim();
    if (!content || loadingState !== "idle") return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoadingState("sending");

    try {
      const response = await fetch("/api/prototype/student-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload("message", content)),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Bericht versturen mislukt.");

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data.message ??
            `Ik denk graag met je mee, ${firstName}. Vertel me iets meer.`,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bericht versturen mislukt.");
    } finally {
      setLoadingState("idle");
    }
  }

  const wrapperClassName = compact
    ? "flex min-h-[540px] flex-col rounded-[22px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
    : "flex min-h-[480px] flex-col rounded-[18px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]";

  return (
    <section className={wrapperClassName}>
      <div className={`flex-1 space-y-4 overflow-y-auto ${compact ? "px-4 py-4" : "px-5 py-5"}`}>
        {compact && (
          <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-900">
            <p className="font-semibold">Juf Aimee kijkt mee met deze opdracht.</p>
            <p className="mt-1 text-violet-800">
              Ze gebruikt de opdracht, je profiel en de tekst die nu in je werkvak staat. Na opslaan onthoudt ze ook je laatste versie beter.
            </p>
          </div>
        )}

        {loadingState === "booting" ? (
          <div className="max-w-[560px] rounded-[18px] border border-slate-200 bg-[#f6f4f2] px-4 py-4">
            <p className="text-lg font-semibold text-[#5b42ff]">Juf Aimee</p>
            <p className="mt-1 text-xs text-slate-400">AI Onderwijsassistent</p>
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
              <Loader2 className="size-4 animate-spin" />
              Ik haal eerst jouw profiel, opdracht en OPP-context op...
            </div>
          </div>
        ) : null}

        {messages.map((message, index) => (
          <div
            className={
              message.role === "assistant"
                ? "max-w-[620px] rounded-[18px] border border-slate-200 bg-[#f6f4f2] px-4 py-4"
                : "ml-auto max-w-[520px] rounded-[18px] bg-[#474747] px-4 py-4 text-white"
            }
            key={`${message.role}-${index}-${message.content.slice(0, 24)}`}
          >
            {message.role === "assistant" ? (
              <>
                <p className="text-lg font-semibold text-[#5b42ff]">Juf Aimee</p>
                <p className="mt-1 text-xs text-slate-400">AI Onderwijsassistent</p>
              </>
            ) : null}
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{message.content}</p>
          </div>
        ))}

        {loadingState === "sending" ? (
          <div className="max-w-[560px] rounded-[18px] border border-slate-200 bg-[#f6f4f2] px-4 py-4">
            <p className="text-lg font-semibold text-[#5b42ff]">Juf Aimee</p>
            <p className="mt-1 text-xs text-slate-400">AI Onderwijsassistent</p>
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
              <Loader2 className="size-4 animate-spin" />
              Ik denk even na over een antwoord dat bij {firstName} en deze opdracht past...
            </div>
          </div>
        ) : null}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-200 px-3 py-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50"
              key={prompt}
              onClick={() => void sendMessage(prompt)}
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 rounded-[18px] border border-slate-200 bg-white p-2 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <input
            className="h-11 flex-1 rounded-[14px] border border-slate-200 bg-[#f8f8f8] px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            disabled={loadingState !== "idle"}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Typ je vraag hier..."
            value={input}
          />
          <button
            className="inline-flex size-12 items-center justify-center rounded-[14px] bg-[#a8a39d] text-white transition hover:bg-[#96918b] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loadingState !== "idle" || !input.trim()}
            onClick={() => void sendMessage()}
            type="button"
          >
            <Send className="size-4" />
          </button>
        </div>

        {error ? (
          <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </div>
    </section>
  );
}
