"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";

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

function AssistantBubble({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[620px] rounded-2xl rounded-tl-sm border border-violet-100 bg-violet-50/80 px-4 py-3.5 shadow-sm">
      <div className="flex items-center gap-1.5">
        <Sparkles className="size-3.5 text-violet-500" />
        <span className="text-sm font-bold text-violet-600">Juf Aimee</span>
        <span className="text-[11px] text-violet-400">· AI-onderwijsassistent</span>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

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
    ? "flex min-h-[540px] flex-col overflow-hidden rounded-[22px] border border-violet-200 bg-white shadow-[0_14px_36px_rgba(99,102,241,0.12)]"
    : "flex min-h-[480px] flex-col overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-[0_14px_36px_rgba(99,102,241,0.12)]";

  return (
    <section className={wrapperClassName}>
      <div
        className={`flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-violet-50/50 to-white ${
          compact ? "px-4 py-4" : "px-5 py-5"
        }`}
      >
        {compact && (
          <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-900">
            <p className="font-semibold">Juf Aimee kijkt mee met deze opdracht.</p>
            <p className="mt-1 text-violet-800">
              Ze gebruikt de opdracht, je profiel en de tekst die nu in je werkvak
              staat. Na opslaan onthoudt ze ook je laatste versie beter.
            </p>
          </div>
        )}

        {loadingState === "booting" ? (
          <AssistantBubble>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Loader2 className="size-4 animate-spin text-violet-500" />
              Ik haal eerst jouw profiel, opdracht en OPP-context op...
            </div>
          </AssistantBubble>
        ) : null}

        {messages.map((message, index) =>
          message.role === "assistant" ? (
            <AssistantBubble
              key={`${message.role}-${index}-${message.content.slice(0, 24)}`}
            >
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
                {message.content}
              </p>
            </AssistantBubble>
          ) : (
            <div
              className="ml-auto max-w-[520px] rounded-2xl rounded-tr-sm bg-gradient-to-br from-violet-600 to-blue-500 px-4 py-3 text-white shadow-sm"
              key={`${message.role}-${index}-${message.content.slice(0, 24)}`}
            >
              <p className="whitespace-pre-wrap text-sm leading-7">
                {message.content}
              </p>
            </div>
          ),
        )}

        {loadingState === "sending" ? (
          <AssistantBubble>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Loader2 className="size-4 animate-spin text-violet-500" />
              Ik denk even na over een antwoord dat bij {firstName} en deze
              opdracht past...
            </div>
          </AssistantBubble>
        ) : null}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-violet-100 bg-white px-3 py-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 transition hover:bg-violet-100"
              key={prompt}
              onClick={() => void sendMessage(prompt)}
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-violet-200 bg-white p-2 shadow-sm">
          <input
            className="h-11 flex-1 rounded-xl border border-violet-200 bg-violet-50/60 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
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
            className="inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 text-white shadow-md shadow-violet-200 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
