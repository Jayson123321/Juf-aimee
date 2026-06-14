# Juf Aimee 
 
> AI-assistent voor leraren in het hoogbegaafd onderwijs — gebouwd voor [Digital Life](https://digitallifecentre.nl/)
 
## Over het project
 
Juf Aimee is een AI-assistent die leraren ondersteunt bij het begeleiden van hoogbegaafde leerlingen. Het uitgangspunt is **responsible AI**: de AI vult de leraar aan, en de leraar vult de AI aan. Niet de AI als vervanger, maar als verlengstuk van de leraar.
 
Het systeem genereert gepersonaliseerde opdrachten op basis van het profiel van elke leerling — afgestemd op hun IQ, leerbehoefte, interesses en aandachtspunten en nog veel meer.
 
---
 
## Architectuur
 
```
Juf-aimee/
├── app/              # Next.js webapplicatie (leraar-dashboard)
├── components/       # Herbruikbare UI-componenten
├── lib/              # Gedeelde logica en utilities
├── mcp/              # Edurep MCP server (lesmateriaal zoeken)
│   ├── src/
│   └── dist/
├── prisma/           # Database schema en migraties
└── scripts/          # OPP-verwerking scripts
```
 
---
 
## Kernfunctionaliteiten
 
### RAG-systeem op OPP-documenten
Leraren werken met **Ontwikkelingsperspectieven (OPP)** per leerling — Word-documenten met informatie zoals:
- IQ en cognitief niveau
- Leerbehoeften en leerstijl
- Interesses en motivatie
- Zwakheden en aandachtspunten

Deze documenten worden automatisch omgezet naar vectoren en opgeslagen in een PostgreSQL database met de pgvector extensie. Prisma wordt gebruikt als ORM. Bij het genereren van een opdracht zoekt het systeem het meest relevante chunks OPP-profiel op via cosine similarity en geeft de AI context over de leerling.

### Gepersonaliseerde opdrachten
Op basis van het OPP-profiel genereert de AI opdrachten die passen bij het niveau en de interesses van de leerling. Geen generieke taken, maar maatwerk.
 
###### Edurep MCP Server
Een zelfgebouwde [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server die verbinding maakt met de [Edurep](https://edurep.kennisnet.nl) database — de grootste Nederlandse database voor educatief lesmateriaal.

De MCP server kan worden gekoppeld aan Claude Desktop of Claude Code, waardoor de llm automatisch passend lesmateriaal kan opzoeken op basis van vak, niveau en leerdoelen.

> Vereist Claude Desktop of Claude Code om de MCP server te gebruiken.
 
---
 
## Tech stack
 
| Onderdeel | Technologie |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| AI | Ollama (lokaal), Anthropic Claude |
| Vector database | Prisma + embeddings |
| Lesmateriaal | Edurep API via MCP server |
| Database | PostgreSQL via Prisma |
| Containerisatie | Docker |
 
---
 
## MCP Server (Edurep)
 
De `mcp/` map bevat een zelfgebouwde MCP server die Claude Desktop en Claude Code in staat stelt om educatief materiaal op te zoeken via de Edurep API.
 
```bash
# Installeren
cd mcp
npm install
 
# Compileren
npm run build
 
# Registreren in Claude Code
claude mcp add-json edurep '{"type":"stdio","command":"node","args":["./mcp/dist/index.js"]}'
```
 
Beschikbare tools:
- `search_materials` — zoek educatief materiaal op trefwoord
---
 
## Responsible AI
 
Dit project is gebouwd met de volgende principes:
 
- **De leraar beslist** — AI genereert suggesties, de leraar keurt goed
- **Transparantie** — het systeem legt uit waarom een opdracht bij een leerling past
- **Privacy** — OPP-data blijft lokaal, geen persoonsgegevens naar externe modellen
- **Aanvullend, niet vervangend** — AI als gereedschap, niet als autoriteit
---
 
## Lokaal draaien
 
```bash
# Kloon de repo
git clone https://github.com/jayson123321/juf-aimee.git
cd juf-aimee
 
# Installeer dependencies
npm install
 
# Configureer omgevingsvariabelen
cp .env.example .env
 
# Start de applicatie
npm run dev
```
 
> Vereist: Node.js 18+, Docker (voor de database), Ollama (voor lokale AI)
 
---
## Contributors

Dit project is gebouwd door een team van Digital Life studenten.

**Mijn bijdragen:**
- RAG-systeem — OPP-documenten verwerken naar vectoren, embeddings pipeline, pgvector integratie
- Edurep MCP Server — zelfgebouwde MCP server voor lesmateriaal zoeken via Claude

Voor een volledig overzicht van alle bijdragen, zie de [commit history](https://github.com/jayson123321/juf-aimee/commits/main). 

## Gemaakt voor
 
[Digital Life](https://digitallife.nl) — opleiding aan de Hogeschool van Amsterdam
