# Juf Aimee — AI-onderwijsassistent

**Team:** Shehbaaz, Jayson, Mazen, Ruben  
**Opdrachtgever:** Lectoraat Digital Life, Hogeschool van Amsterdam  
**Studio:** Responsible Applied Artificial Intelligence (RAAI)

---

## Wat is Juf Aimee?

Juf Aimee is een AI-onderwijsassistent die leraren ondersteunt bij het begeleiden van **hoogbegaafde leerlingen** in het primair onderwijs. Het systeem analyseert individuele leerlingportfolio's (OPP's) en helpt leraren met:

- Gepersonaliseerde opdrachten genereren op basis van het leerlingprofiel
- Inzicht in het niveau en de voortgang van leerlingen
- Gerichte ondersteuning zonder de leraar te vervangen

De kern van het project is **Responsible AI**: de leraar blijft altijd in controle en de AI is transparant in haar aanbevelingen.

---

## Projectoverzicht

| Fase | Status |
|------|--------|
| Probleemverkenning & concept | ✅ Afgerond (Sprint 1) |
| Onderzoek & literatuurstudie | ✅ Afgerond (Sprint 1–2) |
| Prototype & gebruikerstesten | ✅ Afgerond (Sprint 2) |
| Technische implementatie (RAG/RAS pipeline) | ✅ Afgerond |
| Advies & aanbevelingen | ✅ Afgerond |

---

## Navigatiegids

Gebruik de zijbalk om door de documentatie te navigeren. Hieronder een overzicht van wat je in elke sectie vindt:

### [Onderzoek](Onderzoek/index.md)
Literatuuronderzoek en analyse van bestaande platforms. Bevat onder andere:
- Hybrid AI en mens-AI samenwerking
- RAG en vector databases
- Analyse van bestaande onderwijsplatforms (Khanmigo, Arcadin)

### [Modelkeuze](Modelkeuze/Modelkeuze.md)
Onderbouwde keuze voor het AI-model. Bevat vergelijkende tests en uiteindelijke aanbeveling.

### [Prototype](Prototype/index.md)
Ontwerp en testresultaten van het Juf Aimee prototype. Bevat:
- Designverantwoording
- Testplan en testresultaten met echte leraren
- Dashboard- en adviesprototype

### [Advies](Advies/index.md)
Afgeronde adviesrapporten met onderbouwde aanbevelingen voor de opdrachtgever.

### [Kwaliteitsevaluatie](Kwaliteitsevaluatie/llm-as-judge.md)
Hoe de kwaliteit van AI-gegenereerde opdrachten wordt bewaakt via een LLM-as-judge pipeline.

### [Technische documentatie](documentatie/authenticatie-rolbeheer.md)
Implementatiedetails van het platform, waaronder authenticatie en rolbeheer.

### [Sprints](Sprints/index.md)
Procesoverzicht per sprint: doelen, resultaten en retrospectives.

### [Samenwerkingscontract](Samenwerkingscontract.md)
Teamafspraken over samenwerking, rolverdeling en werkwijze.

---

## Technologie

- **AI-model:** Qwen2.5 (lokaal gehost via Ollama)
- **Pipeline:** RAG / RAS (Retrieval Augmented & Structured Generation)
- **Frontend:** Next.js
- **Database:** PostgreSQL + Prisma (met vector embeddings)
- **Kwaliteitscontrole:** LLM-as-judge evaluatiepipeline
