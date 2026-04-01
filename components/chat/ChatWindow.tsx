"use client"

import { useState, useRef, useEffect } from "react"
import Message from "./Message"

type ChatMessage = { role: "user" | "assistant"; content: string }

export default function ChatWindow({ studentId }: { studentId?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hallo! Ik ben Juf Aimee. Ik kan je helpen met informatie over leerlingen, opdrachten genereren en meer. Wat wil je weten?",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage() {
    const message = input.trim()
    if (!message || loading) return

    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: message }])
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, studentId, history: messages }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response ?? data.error ?? "Er is iets misgegaan." },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Verbindingsfout. Controleer of Ollama actief is." },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-violet-700 text-white px-6 py-4 shadow">
        <h1 className="text-xl font-semibold">Juf Aimee — Assistent</h1>
        <p className="text-violet-200 text-sm">Stel een vraag over leerlingen of genereer een opdracht</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, i) => (
          <Message key={i} message={msg} />
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-400 px-4 py-3 rounded-2xl shadow text-sm rounded-bl-sm animate-pulse">
              Juf Aimee denkt na...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="bg-white border-t px-4 py-4 flex gap-3 items-end">
        <textarea
          className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 max-h-32"
          rows={1}
          placeholder="Typ je vraag... (Enter om te sturen)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white px-5 py-3 rounded-xl text-sm font-medium transition"
        >
          Stuur
        </button>
      </div>
    </div>
  )
}
