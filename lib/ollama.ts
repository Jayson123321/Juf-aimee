import { Ollama } from "ollama"
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434"

console.log(`🔌 Ollama host: ${OLLAMA_HOST}`)  // ← tijdelijk toevoegen

export const ollama = new Ollama({ host: OLLAMA_HOST })
export const EMBED_MODEL = process.env.EMBED_MODEL || "jeffh/intfloat-multilingual-e5-large:f16"
export const GEN_MODEL = "qwen3:14b"
export const JUDGE_MODEL = "vicgalle/prometheus-7b-v2.0:latest"

function sanitizeEmbeddingInput(text: string) {
  return text
    .normalize("NFKC")
    .replace(/\u0000/g, " ")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function isValidEmbedding(embedding: number[]) {
  return (
    Array.isArray(embedding) &&
    embedding.length > 0 &&
    embedding.every((value) => Number.isFinite(value))
  )
}

const MAX_EMBED_CHARS = 1000

export async function getEmbedding(text: string): Promise<number[]> {
  const base = sanitizeEmbeddingInput(text).slice(0, MAX_EMBED_CHARS)
  const variants = [
    base,
    base.replace(/[^\p{L}\p{N}\p{P}\p{Zs}]/gu, " "),
    base.slice(0, 400),
  ].filter(Boolean)

  let lastError: unknown

  for (const variant of variants) {
    try {
      const response = await ollama.embed({ model: EMBED_MODEL, input: `query: ${variant}` })
      const embedding = response.embeddings[0]

      if (!isValidEmbedding(embedding)) {
        throw new Error("Embedding bevat ongeldige waarden")
      }

      return embedding
    } catch (error) {
      lastError = error
    }
  }

  throw new Error(
    `Embedding genereren mislukt: ${
      lastError instanceof Error ? lastError.message : "onbekende fout"
    }`,
  )
}
