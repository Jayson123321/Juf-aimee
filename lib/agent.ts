import type { Tool, Message } from "ollama"
import { ollama, GEN_MODEL } from "@/lib/ollama"
import { executeTool } from "@/lib/tools"

function buildSystemPrompt(studentList: string): string {
  return `Je bent Juf Aimee, een vriendelijke AI-onderwijsassistent.
Je helpt leerkrachten met informatie over leerlingen en het genereren van opdrachten.
Reageer altijd vriendelijk en behulpzaam in het Nederlands.

Beschikbare leerlingen:
${studentList}

Regels:
- Gebruik de tool search_opp met het exacte student_id uit de lijst hierboven om OPP-informatie op te zoeken.
- Verzin NOOIT een student_id — gebruik alleen de IDs uit de lijst hierboven.
- Vraag de gebruiker NOOIT om een student_id — jij hebt de lijst al.`
}

type ChatMessage = { role: "user" | "assistant"; content: string }

export async function runAgent(
  userMessage: string,
  tools: Tool[],
  context: { studentId?: string; studentList?: string; history?: ChatMessage[] } = {}
): Promise<string> {
  const systemPrompt = buildSystemPrompt(context.studentList ?? "Geen leerlingen beschikbaar.")

  const previousMessages: Message[] = (context.history ?? []).map((m) => ({
    role: m.role,
    content: m.content,
  }))

  const history: Message[] = [
    { role: "system", content: systemPrompt },
    ...previousMessages,
    { role: "user", content: userMessage },
  ]

  while (true) {
    const response = await ollama.chat({ model: GEN_MODEL, messages: history, tools, options: { temperature: 0 }})

    history.push(response.message)

    if (!response.message.tool_calls || response.message.tool_calls.length === 0) {
      return response.message.content ?? ""
    }

    for (const call of response.message.tool_calls) {
      const result = await executeTool(
        call.function.name,
        call.function.arguments as Record<string, unknown>,
        context
      )
      history.push({ role: "tool" as const, content: result })
    }
  }
}
