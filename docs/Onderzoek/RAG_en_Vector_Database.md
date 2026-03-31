# RAG en Vector Database

## Inhoudsopgave
1. [Wat is het probleem?](#wat-is-het-probleem)
2. [Oplossing: RAG](#oplossing-rag)
3. [Stap 1 — Chunks](#stap-1--chunks)
4. [Stap 2 — Vectors / Embeddings](#stap-2--vectors--embeddings)
5. [Stap 3 — Opslaan in de database](#stap-3--opslaan-in-de-database)
6. [Stap 4 — Zoeken](#stap-4--zoeken)
7. [Optie A: Standaard RAG](#optie-a-standaard-rag)
8. [Optie B: Agentic RAG](#optie-b-agentic-rag)
9. [Overzicht bestanden](#overzicht-bestanden)

---

## Wat is het probleem?

Een OPP-document (ontwikkelingsperspectief) bevat veel tekst over een leerling. We willen dat een AI op basis van dit document een passende opdracht kan genereren.

Het probleem is dat een AI-model niet zomaar een heel document kan lezen elke keer dat een leerkracht iets vraagt. Dat is:
- Te traag
- Te duur (bij externe modellen)
- Niet schaalbaar als er tientallen leerlingen zijn

---

## Oplossing: RAG

**RAG** staat voor **Retrieval-Augmented Generation**. In plaats van het hele document door te sturen, zoek je eerst de *meest relevante stukjes tekst* op, en geef je die aan de AI.

Het werkt in 4 stappen:

```
OPP document
    ↓
1. Opsplitsen in chunks
    ↓
2. Elke chunk omzetten naar een vector (embedding)
    ↓
3. Opslaan in PostgreSQL met pgvector
    ↓
4. Bij een vraag: zoek de dichtstbijzijnde chunks → stuur naar AI
```

---

## Stap 1 — Chunks

Een chunk is een klein stukje tekst uit het OPP-document, ongeveer 400 tekens lang.

**Waarom opsplitsen?**

| Heel document sturen | Chunks gebruiken |
|---|---|
| Traag, groot, duur | Snel, klein, goedkoop |
| AI krijgt veel irrelevante info | AI krijgt alleen relevante info |
| Moeilijk te zoeken | Makkelijk te doorzoeken |

**Hoe werkt het in de code?**

In `scripts/ingest-opp.ts` splitst de functie `chunkText()` het document op:
1. Splits op dubbele regelafstanden (alinea's)
2. Groepeer alinea's totdat ze ~400 tekens zijn
3. Gooi chunks weg die korter zijn dan 50 tekens (ruis)

---

## Stap 2 — Vectors / Embeddings

Een **vector** is een lijst van getallen die de *betekenis* van een stuk tekst vastlegt.

Het AI-model `jeffh/intfloat-multilingual-e5-large` zet elke chunk om naar een lijst van **1024 getallen**.

**Waarom getallen?**

Tekst met vergelijkbare betekenis krijgt vergelijkbare getallen:

```
"heeft moeite met begrijpend lezen"   → [0.12, -0.84, 0.33, ...]
"begrijpt geschreven tekst moeilijk"  → [0.11, -0.81, 0.35, ...]  ← bijna hetzelfde!

"houdt van voetbal"                   → [0.91, 0.05, -0.67, ...]  ← heel anders
```

Door de afstand tussen vectoren te berekenen, kun je meten hoe *semantisch vergelijkbaar* twee stukken tekst zijn — ook al gebruiken ze andere woorden.

---

## Stap 3 — Opslaan in de database

De database gebruikt de PostgreSQL-extensie **pgvector** om vectoren op te slaan en te doorzoeken.

**Schema:**

```
Leerling
  └── OppChunk[]
        ├── id
        ├── leerlingId   → welke leerling
        ├── tekst        → de ruwe tekst van de chunk
        ├── embedding    → vector(1024), de 1024 getallen
        └── createdAt
```

De extensie is ingeschakeld via:
```sql
CREATE EXTENSION IF NOT EXISTS "vector";
```

En in Prisma (`prisma/schema.prisma`):
```prisma
datasource db {
  extensions = [pgvector(map: "vector")]
}
```

---

## Stap 4 — Zoeken

Bij een zoekopdracht wordt de vraag ook omgezet naar een vector. Daarna zoekt pgvector welke chunks de **kleinste afstand** hebben tot die vector.

```sql
SELECT tekst, 1 - (embedding <=> query_vector) as score
FROM "OppChunk"
WHERE "leerlingId" = 1
ORDER BY embedding <=> query_vector
LIMIT 3
```

De `<=>` operator is de **cosine distance** — hoe kleiner de waarde, hoe meer de teksten op elkaar lijken. De score `1 - distance` geeft een getal tussen 0 en 1, waarbij 1 = perfecte match.

---

## Optie A: Standaard RAG

Dit is de eenvoudigste opzet. De code bepaalt zelf welke zoekterm gebruikt wordt.

```
Leerkracht vraagt om opdracht
    ↓
Code zoekt altijd met vaste query (bijv. "onderwijsbehoefte")
    ↓
Top 3 chunks worden opgehaald
    ↓
Chunks + vraag → generatie-LLM → opdracht
```

**Voordeel:** simpel en voorspelbaar
**Nadeel:** de zoekopdracht is statisch, niet aangepast aan de context

---

## Optie B: Agentic RAG

Bij agentic RAG besluit de AI zelf wat het wil opzoeken. De AI krijgt een **tool** (zoekfunctie) die het meerdere keren kan aanroepen.

```
Leerkracht vraagt om opdracht
    ↓
AI denkt: "ik moet eerst het leesniveau weten"
AI roept aan: search_opp("leesniveau begrijpend lezen")
    ↓
AI ontvangt: relevante chunks
    ↓
AI denkt: "ik wil ook de interesses weten"
AI roept aan: search_opp("interesses en motivatie")
    ↓
AI ontvangt: meer chunks
    ↓
AI genereert de opdracht op basis van alles wat het heeft gevonden
```

**Voordeel:** flexibeler, AI past zoekopdrachten aan op de situatie
**Nadeel:** iets trager door meerdere rondes

**De tool die de AI kan aanroepen:**

```typescript
{
  name: "search_opp",
  description: "Zoek relevante informatie uit het OPP van de leerling",
  parameters: {
    query: string  // bijv. "leesniveau" of "aandachtspunten rekenen"
  }
}
```

De agent loop in `scripts/test-agent.ts` werkt als volgt:
1. Stuur prompt + tool-definitie naar het LLM
2. Als het LLM een tool aanroept → voer de zoekopdracht uit
3. Stuur resultaat terug naar het LLM
4. Herhaal totdat het LLM een eindantwoord geeft (geen tool-aanroep meer)

---

## Overzicht bestanden

| Bestand | Wat het doet |
|---|---|
| `scripts/ingest-opp.ts` | Leest OPP-documenten in, maakt chunks, slaat vectoren op |
| `scripts/test-search.ts` | Test of vector search werkt voor een leerling |
| `scripts/test-agent.ts` | Test de volledige agentic RAG pipeline |
| `prisma/schema.prisma` | Database schema met `OppChunk` en `vector(1024)` |
| `app/lib/db.ts` | Prisma client voor gebruik in de Next.js app |

**Gebruikte modellen (via Ollama):**

| Model | Doel |
|---|---|
| `jeffh/intfloat-multilingual-e5-large:f16` | Embeddings maken (tekst → vector) |
| `llama3.1` | Tekst genereren + tool calling (agentic RAG) |
