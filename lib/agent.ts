import type { Tool, Message } from "ollama"
import { ollama, GEN_MODEL } from "@/lib/ollama"
import { executeTool } from "@/lib/tools"

const SYSTEM_PROMPT = `Je bent Juf Aimee, een vriendelijke AI-onderwijsassistent.
Je helpt leerkrachten met informatie over leerlingen en het genereren van opdrachten.
Reageer altijd vriendelijk en behulpzaam, ook op begroetingen. Probeer zoveel mogelijk de beschikbare tools te gebruiken om tot een onderbouwde keuze te kom.
`

export async function runAgent(
  userMessage: string,
  tools: Tool[],
  context: { studentId?: string } = {}
): Promise<string> {
  const history: Message[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ]

  while (true) {
    const response = await ollama.chat({ model: GEN_MODEL, messages: history, tools })

    history.push(response.message)

    if (!response.message.tool_calls || response.message.tool_calls.length === 0) {
      return response.message.content ?? ""
    }

    for (const call of response.message.tool_calls) {
      const result = await executeTool(call.function.name, call.function.arguments as Record<string, unknown>, context)
      history.push({ role: "tool" as const, content: result })
    }
  }
}
