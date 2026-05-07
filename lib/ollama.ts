import { Ollama } from "ollama"

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434"

console.log(`Ollama host: ${OLLAMA_HOST}`)

export const ollama = new Ollama({ host: OLLAMA_HOST })
export const EMBED_MODEL = process.env.EMBED_MODEL || "jeffh/intfloat-multilingual-e5-large:f16"
export const GEN_MODEL = process.env.GEN_MODEL || "qwen2.5:14b-instruct-q4_K_M"
export const ASSISTANT_MODEL = process.env.ASSISTANT_MODEL || "mistral-nemo:12b"
export const GEN_MODEL_LOCALE = "gemma4:31b-cloud"
export const JUDGE_MODEL = "vicgalle/prometheus-7b-v2.0:latest"

const UNLOAD_POLL_MS = 250
const UNLOAD_TIMEOUT_MS = 10_000
const MAX_EMBED_CHARS = 1000

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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type OllamaPsResponse = {
  models?: Array<{ name?: string; model?: string }>
}

export async function getLoadedOllamaModelNames() {
  try {
    const response = (await ollama.ps()) as OllamaPsResponse
    return (response.models ?? [])
      .map((entry) => entry.name || entry.model || "")
      .map((name) => name.trim())
      .filter(Boolean)
  } catch {
    return []
  }
}

async function waitUntilOllamaModelReleased(model: string, timeoutMs = UNLOAD_TIMEOUT_MS) {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const loaded = await getLoadedOllamaModelNames()
    if (!loaded.includes(model)) {
      return
    }

    await sleep(UNLOAD_POLL_MS)
  }
}

export async function releaseOllamaModel(model: string) {
  const normalizedModel = model.trim()
  if (!normalizedModel) return

  const loaded = await getLoadedOllamaModelNames()
  if (!loaded.includes(normalizedModel)) return

  try {
    await ollama.generate({
      model: normalizedModel,
      prompt: "",
      keep_alive: 0,
      options: { num_predict: 0 } as never,
    })
  } catch {
    try {
      await ollama.embed({
        model: normalizedModel,
        input: "release",
        keep_alive: 0,
      })
    } catch {
      // Ignore unload errors and fall back to polling the model list.
    }
  }

  await waitUntilOllamaModelReleased(normalizedModel)
}

export async function releaseAllOllamaModels() {
  const loadedModels = await getLoadedOllamaModelNames()

  for (const model of loadedModels) {
    await releaseOllamaModel(model)
  }
}

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
      const response = await ollama.embed({
        model: EMBED_MODEL,
        input: `query: ${variant}`,
        keep_alive: 0,
      })
      const embedding = response.embeddings[0]

      if (!isValidEmbedding(embedding)) {
        throw new Error("Embedding bevat ongeldige waarden")
      }

      return embedding
    } catch (error) {
      lastError = error
    } finally {
      await releaseOllamaModel(EMBED_MODEL)
    }
  }

  throw new Error(
    `Embedding genereren mislukt: ${
      lastError instanceof Error ? lastError.message : "onbekende fout"
    }`,
  )
}
