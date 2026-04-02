# Advies: Juf Aimee AI-Assistent

**Datum:** vrijdag 2 april 2026  
**Leeruitkomst**: Advies     
**Deelnemers**:    

- Shehbaaz
- Jayson 


---

## Inleiding

Dit advies is gebaseerd op relevante inzichten in bestaande leerlingen platforms en wetenschappelijk onderzoek voor de Juf Aimee AI-assistent voor leraren met hoogbegaafde leerlingen. Wij hebben een prototype ontworpen; het is de bedoeling dat wij verder onderzoek doen naar bestaande leerplatforms en literatuur besturen zodat wij wetenschappelijk onderbouwde interpretaties in ons platform kunnen integreren. 

Daarnaast gaan wij ook gebruikerstesten uitvoeren bij echte leerkrachten zodat wij relevante feedback kunnen ontvangen op het leerplatform waar wij rekening mee kunnen houden bij het realiseren van het leerplatform.

**Adviesproces:**
- **Analyse:** Onderzoeken de behoefte/gebruiksgemak van de leraar
- **Ontwerp:** prototyping en testen

---


## Prototype voorbeeld

Dit is de eerste versie van ons prototype, en daarin laat ik de onderdelen zien die we willen realiseren voor het leerplatform voor hoogbegaafde leerlingen.

### Dashboard 
![dashboard](images/dashboard.png)
>*in de voortangsbalk is met kleuren de progressie zichtbaar op het niveau waarbinnen de leerling werkt*

### Profiel leerling

![alt text](images/leerlingprofiel.png)
>*zichtbaar voor de leraar wat de eigenschappen en motivaties zijn van de leerling*

### Opdrachten aanbevelingen op leerlingprofiel en observaties

![alt text](<images/opdracht aanbeveling.png>)
>*Leerlingprofielen zijn leidend voor het genereren van nieuwe opdrachten, de observaties van de leraar wordt ook meegenomen in het samenstellen van de nieuwe opdracht*

### Opdracht generation 
![alt text](<images/opdracht genereren.png>)

>*hierin vult de leraar het vak in meestal gebaseerd op de interesses van de leerling om de nieuwe opdracht te genereren*

### Bronnen bibliotheek

![alt text](<images/bronnen bibliotheek.png>)

>*bibliotheek waarin gegenereerde opdrachten worden opgeslagen zodat ze kunnen helpen genereren van nieuwe opdrachten met meer uitdaging.*

## Inleiding

Dit advies is gebaseerd op een functioneel prototype van de Juf Aimee AI-assistent, een vernieuwend leerplatform specifiek ontworpen voor leraren die werken met hoogbegaafde leerlingen. Ons prototype is ontwikkeld met een **RAG (Retrieval-Augmented Generation) architectuur** die individuele Onderwijs Portfolio's (OPP's) van leerlingen integrale analyseert encontextuele, gepersonaliseerde ondersteuning biedt.

**Gerealiseerde-functionaliteit:**
- **AI-gestuurde chat** met Ollama (llama3.2:3b)端个 teachers' contextaware vragen over leerlingen
- **Vector database** (PostgreSQL + pgvector) voor semantische zoekopdrachten in OPP-documenten
- **Documentverwerking** van Word-bestanden via mammoth.js met chunking strategie
- **Gebruikersbeheer** met rolensysteem (leraar/admin) en authenticatie
- **Dashboard** voor leerlingoverzicht en Bloom-niveau tracking
- **Studentprofielen** met gedetailleerde achtergrondinformatie

**Validatie:** 
- Proof-of-concept successfully draait met 6 teststudenten en hun OPP-documenten
- RAG-pipeline verwerkt documenten tot vector embeddings voor intelligent zoeken
- Chat-agent bruikbaar via API endpoint met tool-calling voor student lookup en document search

---

## Prototype voorbeeld

Ons werkende prototype toont de volgende functionaliteiten:

### AI Chat Interface
 Dokters kunnen natuurlijke taal vragen stellen zoals:
 * "Wat is het leerniveau van Julia?"
 * "Welke aandachtspunten zijn genoemd in Milan's OPP?"
 * "Toon me alle leerlingen in groep 6"

De AI-agent gebruikt twee tools:
1. **list_students** - toont alle leerlingen met ID, groep en Bloom-niveau
2. **search_opp** - doorzoekt het OPP van een specifieke leerling op_query

### Database Schema
 Onze Prisma schema ondersteunt:
 - **Studenten** met bloomNiveau (1-6) en groepindeling
 - **OppChunks** met vector embeddings (1024 dimensies) voor semantic search
 - **Assignments** voor taken en voortgang
 - **User roles** voor beveiliging en toegangscontrole

### Dashboard Concept (gebouwd)
 - Overzicht van alle leerlingen
 - Bloom-niveau indicatie per leerling
 - Toegang tot individuele OPP-documenten
 - Integratie met AI-chat voor directe ondersteuning

---

## Aanbevelingen

### Aanbeveling 1
**Advies:** Implementeer een **RAG-gebaseerde AI-assistent** als kernfunctionaliteit voor het ondersteunen van leraren met hoogbegaafde leerlingen, waarbij elk leerling een persoonlijk OPP heeft dat geïndexeerd wordt in een vector database.

**Onderbouwing:** 
Uit onze analyse blijkt dat hoogbegaafde leerlingen sterk verschillen in hun leervormen, interesses en cognitieve profielen. Traditionele systemen bieden geen manier om dit individuele profiel effectief te benutten. Onze RAG-aanpak lost dit op door:
- OPP-documenten te converteren naar semantische vector representations
- Gelijksoortige content te vinden via cosine similarity
- De LLM-context te verrijken met relevante OPP-fragmenten
- Hierdoor krijgt de leraar gepersonaliseerde, document-gestuurde antwoorden

**Technische keuzes gemotiveerd:**
- **Ollama** (local LLM) → data privacy, geen externe API-kosten, volledige controle
- **pgvector** → scheibare, relationele database met native vector support
- **Mammoth.js** → robuuste Word-document paring, essentieel voor bestaande OPP's
- **Next.js App Router** → moderne, server-side rendering met API routes

**(Maatschappelijke) Impact:**
- **Voor docenten:** 
  - Bespaart uren aan administratief werk bij het doorzoeken van OPP's
  - Biedt snelle toegang tot individuele leerlinginformatie
  - Versterkt pedagogische besluitvorming met historische context
  - Vermindert cognitieve belasting door informatiecentralisatie

- **Voor leerlingen:**
  - Persoonlijkere begeleiding dankzij compleet leerdossier toegankelijk
  - Snellere reacties op specifieke vragen over hun progressie
  - Erkenning van unieke talenten en behoeften in elke interactie

- **Voor onderwijs:**
  - Democratisering van hoogbegaafdenondersteuning; niet alleen voor 'top-sporters'
  - Duurzame digitalisering van tradisioneel papiergebaseerde OPP's
  - Data-gedreven onderwijspraktijk zonder privacyrisico's (local hosting)
  - Schaalbaar model dat per school geïnstalleerd kan worden

---

### Aanbeveling 2
**Advies:** Bouw een **Bloom-taxonomie dashboard** uit dat per leerling visueel toont op welk denkniveau hij/zij zich bevindt, gekoppeld aan concrete voorbeelden uit de OPP's.

**Onderbouwing:**
Onze database bevat al `bloomNiveau` (1-6) bij Student en Assignment, plus tekstuele OPP-fragmenten. Door AI-driven analyses te combineren met visuele dashboards krijgen leraren inzicht in:
- Verdeling van Blooms niveaus per leerling (radar chart)
- Voorbeeldtaken die bewijs leveren van specifieke niveaus
- Groepsanalyses voor differentiatie planning

De bestaande `search_opp` tool kan uitgebreid worden met Bloom-filtering, zodat docenten kunnen vragen: "Toon me creative thinking voorbeelden van Emma".

**(Maatschappelijke) Impact:**
- **Voor docenten:**
  - Snelle diagnostiek voor differentiatie
  - Ondersteuning bij Bloom-gerechte taakontwikkeling
  - Transparantie over leerlingvoortgang

- **Voor leerlingen:**
  - Zichtbaarheid van eigen groei en sterke punten
  - Personalisering op eigen niveau, niet leeftijd
  - Herkenning van hogere-orde denkvaardigheden

- **Voor onderwijs:**
  - Evidence-based differentiatie
  - Standaardisering van competentie-beoordeling
  - Curriculum-ontwikkeling gebaseerd op klas-samenstelling

---

### Aanbeveling 3
**Advies:** Implementeer **automatische OPP-opdate notificaties** en **dynamische notitiegeneratie** waarbij de AI suggesties doet voor nieuwe aandachtspunten of doelstellingen gebaseerd op recente leerlingprestaties.

**Onderbouwing:**
Momenteel是静态 documents. Echter, hoogbegaafde leerlingen ontwikkelen zich snel en regelmatig OPP-updates zijn cruciaal. Onze voorstel:
- Wanneer een docent een assignment aanmaakt of update, triggert het systeem een AI-analyse van vergelijkbare OPP-fragmenten
- De AI geeft suggesties: "Deze leerlijk toonde eerder interesse in X;overweeg doel Y aan te passen"
- Notificaties naar docenten wanneer een OPP ouder is dan X maanden
- Automatische samenvatting van OPP-updates voor teamoverleggen Dit sluit aan bij het geariveerde prototype: we hebben al een werkende chat-met-OPP functionaliteit en een assignment model. Uitbreiding met scheduled tasks en notificaties is een logische volgende stap.

**(Maatschappelijke) Impact:**
- **Voor docenten:**
  - Proactieve ondersteuning in plaats van reactief zoeken
  - Minder risico op verouderde OPP-informatie
  - Verbeterde teamcommunicatie over leerlingontwikkeling

- **Voor leerlingen:**
  - Actuele begeleiding gebaseerd op recente prestaties
  - Snellere aanpassing van ondersteuningsstrategieën
  - Continuïteit in persoonlijke begeleiding

- **Voor onderwijs:**
  - Hogere kwaliteit van onderwijskundige documentatie
  - Minder administratieve drempels voor OPP-onderhoud
  - Data-gedreven bijhouden van hoogbegaafdenbeleid

---

## Communicatie per Doelgroep

### Voor Docenten
**Toon:** Praktisch, ondersteunend, respectvol  
**Focus:** Directe nut- en tijdbesparing in dagelijkse praktijk  
**Vorm:** Live demo van chat-interface met eige OPP's + hands-on workshop (2 uur)

**Communicatie punten:**
- "Stel vragen in het Nederlands over elke leerling"
- "Vind specifieke informatie in OPP's in seconden ipv uren"
- "Blijf in controle: AI citeert bronnen, u blijft beoordelen"
-voorbeeld: "Toon mij alle aandachtspunten over Milan uit zijn OPP"

### Voor Schoolleiding
**Toon:** Strategisch, verantwoord, innovatief  
**Focus:** ROI, privacy, onderwijskwaliteit, schaalbaarheid  
**Vorm:** Korte presentatie (15 min) + technische brochure + pilot-project voorstel

**Communicatie punten:**
- **ROI:** Besparing van 5-10 uren per docent per maand aan OPP-doeleinden
- **Privacy:** Alle data blijft lokaal; geen cloud; volledige controle
- **Inclusiviteit:** Alle hoogbegaafden krijgen gelijkwaardige begeleiding
- **Schaalbaar:** Eén server per 50-100 docenten; open-source componenten

### Voor Leerlingen (indien relevant)
**Toon:** Transparant, positief, betrekkend  
**Focus:** Hoe AI hen beter kan ondersteunen; benadrukken dat de leraar beslist  
**Vorm:** Korte uitleg in de les + informele Q&A-sessie

**Communicatie punten:**
- "Jullie OPP's helpen de computer jullie beter te begrijpen"
- "De leraar krijgt suggesties, maar blijft de baas"
- "Dit zorgt voor meer tijd voor persoonlijke begeleiding"
- "Jullie feedback telt: wat vind je nuttig?"

### Voor IT-beheer/Technisch personeel
**Toon:** Technisch, transparant, ondersteunend  
**Focus:** Integratie, beveiliging, onderhoud, requirement  
**Vorm:** Technische documentatie + installatieguid + Docker-compose file

**Communicatie punten:**
- Stack: Next.js + Prisma + PostgreSQL (pgvector) + Ollama
- Hardware: 16GB RAM, GPU optioneel (CPU-only werkt)
- Deployment: Docker + Nginx reverse proxy
- Beveiliging: HTTPS mandatory, role-based access control, regular DB backups
- Monitoring: Basic health checks, log rotation

---

### bronnen



