import { Ollama } from "ollama"

export const ollama = new Ollama({ host: "http://localhost:11434" })
export const EMBED_MODEL = "jeffh/intfloat-multilingual-e5-large:f16"
export const GEN_MODEL = "qwen2.5"

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

export async function getEmbedding(text: string): Promise<number[]> {
  const variants = [
    sanitizeEmbeddingInput(text),
    sanitizeEmbeddingInput(text).replace(/[^\p{L}\p{N}\p{P}\p{Zs}]/gu, " "),
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
