"use client"

import { useEffect, useState } from "react"
import { Sparkles, Loader2 } from "lucide-react"

export function StudentAnalysis({ studentId }: { studentId: string }) {
  const [state, setState] = useState<"loading" | "done" | "error">("loading")
  const [analysis, setAnalysis] = useState<string>("")

  useEffect(() => {
    fetch("/api/student-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    })
      .then((res) => res.json())
      .then((data) => {
        setAnalysis(data.analysis ?? data.error)
        setState("done")
      })
      .catch(() => {
        setAnalysis("Analyse mislukt. Controleer of Ollama actief is.")
        setState("error")
      })
  }, [studentId])

  return (
    <div className="mt-0.5">
      {state === "loading" ? (
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" />
          Analyse laden…
        </span>
      ) : (
        <p className={`flex gap-1 text-[11px] leading-relaxed ${state === "error" ? "text-destructive" : "text-muted-foreground"}`}>
          <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
          {analysis}
        </p>
      )}
    </div>
  )
}
