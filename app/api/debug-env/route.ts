import { EMBED_MODEL, GEN_MODEL, JUDGE_MODEL } from "@/lib/ollama"

export async function GET() {
  return Response.json({
    OLLAMA_HOST_env: process.env.OLLAMA_HOST || "NIET GEZET",
    EMBED_MODEL,
    GEN_MODEL,
    JUDGE_MODEL,
  })
}