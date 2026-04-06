# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Juf Aimee** — a Next.js full-stack app that generates personalized Bloom's taxonomy-aligned assignments for elementary school students based on their Individual Development Plans (OPP - Ontwikkelingsperspectief). Uses local LLMs via Ollama with a RAG pipeline backed by pgvector.

## Common Commands

```bash
# Development
npm run dev           # Start Next.js dev server
npm run build         # Production build
npm run lint          # ESLint

# Database
npx prisma migrate dev --name <name>   # Create and run a migration
npx prisma generate                     # Regenerate Prisma client
npx prisma studio                       # Open Prisma Studio GUI

# Data pipeline / RAG scripts
npm run ingest        # Ingest DOCX files from /OPP_bestanden/ → embeddings in DB
npm run test-search   # Test vector similarity search
npm run test-agent    # Test LLM agent with tool calling (full RAG pipeline)
```

## Infrastructure

- **Docker**: Run `docker compose up -d` from the repo root to start PostgreSQL with pgvector
- **Database**: `postgresql://postgres:postgres@localhost:5433/juf-aimee` (port 5433, non-standard)
- **Ollama**: Must be running locally on `http://localhost:11434`
  - Embedding model: `jeffh/intfloat-multilingual-e5-large:f16` (1024-dim, multilingual)
  - Generation model: `llama3.1`

## Architecture

### RAG Pipeline (scripts/)
The core AI logic lives in three standalone TypeScript scripts, not in the Next.js app:

1. **`scripts/ingest-opp.ts`** — Reads `.docx` files from `../OPP_bestanden/`, chunks text (~400 chars), generates embeddings via Ollama, stores in `OppChunk` table with pgvector embeddings.
2. **`scripts/test-search.ts`** — Cosine distance vector search against `OppChunk` embeddings to retrieve relevant student context.
3. **`scripts/test-agent.ts`** — Agentic loop: llama3.1 calls `search_opp` tool → retrieves student OPP chunks → generates a Bloom level 3 assignment.

### Database Models (Prisma)
- `User` — authentication
- `Leerling` (Student) — name, grade group, Bloom level (1–6)
- `OppChunk` — chunked text from student development plans + 1024-dim vector embedding
- `Opdracht` (Assignment) — generated assignments with Bloom taxonomy metadata

Prisma client is output to `generated/` (not `node_modules`). Import from `@/generated/prisma`.

### Next.js App (`app/`)
The web UI is minimal/in-progress. `app/lib/db.ts` provides the singleton Prisma client. Routes for `login/`, `register/`, and `dashboard/` exist as stubs.

### Path Aliases
`@/*` maps to the project root (`web/`), so `@/generated/prisma` and `@/app/lib/db` are valid imports.
