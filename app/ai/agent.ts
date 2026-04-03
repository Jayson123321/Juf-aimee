import type { Message, Tool } from "ollama"
import { ollama, GEN_MODEL } from "@/lib/ollama"
import { executeTool } from "./tools"

export async function runAgentLoop(
  messages: Message[],
  tools: Tool[],
  context: { leerlingId?: string } = {}
): Promise<string> {
  const history = [...messages]

  while (true) {
    const response = await ollama.chat({
      model: GEN_MODEL,
      messages: history,
      tools,
    })

    history.push(response.message)

    if (!response.message.tool_calls || response.message.tool_calls.length === 0) {
      return response.message.content ?? ""
    }

    for (const call of response.message.tool_calls) {
      const args = call.function.arguments as Record<string, unknown>
      const result = await executeTool(call.function.name, args, context)
      history.push({ role: "tool", content: result })
    }
  }
}
