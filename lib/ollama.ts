import { Ollama } from "ollama"

export const ollama = new Ollama({ host: "http://localhost:11434" })
export const EMBED_MODEL = "jeffh/intfloat-multilingual-e5-large:f16"
export const GEN_MODEL = "qwen2.5"

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await ollama.embed({ model: EMBED_MODEL, input: `query: ${text}` })
  return response.embeddings[0]
}
