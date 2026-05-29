# Signalensysteem

## Inhoudsopgave
1. [Wat is het signalensysteem?](#wat-is-het-signalensysteem)
2. [De vier signaaltypen](#de-vier-signaaltypen)
3. [Hoe worden signalen gedetecteerd?](#hoe-worden-signalen-gedetecteerd)
4. [Van signaal naar advies: LLM-verrijking](#van-signaal-naar-advies--llm-verrijking)
5. [Meerdere signalen tegelijk](#meerdere-signalen-tegelijk)
6. [Weergave op het dashboard](#weergave-op-het-dashboard)
7. [Human in the loop: leraarnotities](#human-in-the-loop--leraarnotities)
8. [Dataflow overzicht](#dataflow-overzicht)
9. [Overzicht bestanden](#overzicht-bestanden)

---

## Wat is het signalensysteem?

Het signalensysteem detecteert automatisch patronen in het gedrag van een leerling op basis van diens opdrachtenhistorie. Wanneer een patroon wordt herkend, genereert het systeem een **signaal**: een gestructureerde observatie met een variant (ernst), een bericht voor de leraar en een instructie voor de LLM.

Het doel is niet om de leraar te vervangen, maar om aandachtspunten zichtbaar te maken die anders over het hoofd worden gezien. De leraar blijft altijd degene die beslist wat er met een signaal gebeurt.

---

## De vier signaaltypen

| Signaaltype | Trigger | Variant | Betekenis |
|---|---|---|---|
| `capaciteit` | 2 opeenvolgende opdrachten op hetzelfde Bloom-niveau afgerond | `advice` | Leerling is mogelijk toe aan een hoger niveau |
| `taakbetrokkenheid` | Openstaande opdrachten, maar vandaag niets ingeleverd | `warning` | Leerling lijkt niet actief betrokken |
| `intellectueel` | 3 of meer opdrachten afgerond op Bloom-niveau 5 of 6 | `positive` | Leerling presteert consistent op hoog niveau |
| `Psychomotorisch` | 3 of meer opdrachten afgerond op één dag | `positive` | Leerling werkt in hoog tempo |

**Prioriteitsvolgorde bij weergave:**

```
1. warning      (oranje): vraagt directe aandacht
2. advice       (blauw) : suggestie voor volgende stap
3. positive     (groen) : positieve observatie
```

---

## Hoe worden signalen gedetecteerd?

De functie `computeSignals()` in `lib/signals.ts` evalueert de opdrachtenhistorie van een leerling en geeft een gesorteerde lijst van signalen terug.

**Invoer:**
- `assignments`: alle opdrachten van de leerling, elk met `status`, `bloomNiveau`, `submittedAt` en `createdAt`
- `student`: leerlingprofiel inclusief naam en leraarnotities
- `teacher_feedback_advice`: optionele context van de leraar

**Detectielogica per signaaltype:**

```
CAPACITEIT
  Als de laatste 2 afgeronde opdrachten hetzelfde bloomNiveau hebben
  → Leerling is mogelijk klaar voor het volgende niveau

TAAKBETROKKENHEID
  Als er openstaande opdrachten zijn
  EN de leerling heeft vandaag niets ingeleverd
  → Controleer betrokkenheid; overweeg een eenvoudigere taak

INTELLECTUEEL
  Als 3 of meer afgeronde opdrachten op bloomNiveau 5 of 6 staan
  → Leerling presteert consistent op hoog niveau

PSYCHOMOTORISCH
  Als 3 of meer opdrachten vandaag zijn ingeleverd
  → Leerling werkt snel; overweeg verdieping in plaats van meer taken
```

**Uitvoer per signaal:**

Elk signaal bevat:
- `type`: het signaaltype (zie tabel)
- `variant`: `"warning"` / `"advice"` / `"positive"`
- `teacher_message`: feitelijke observatie voor de leraar
- `llm_instruction`: instructie voor het taalmodel over wat te adviseren
- `adviceJufAimee`: vereenvoudigde adviestekst als startpunt voor het LLM

---

## Van signaal naar advies: LLM-verrijking

Rauwe signalen bevatten feitelijke observaties, maar nog geen persoonlijk advies. De functie `generateSignalAdvice()` verrijkt elk signaal met een advies geschreven door Juf Aimee.

**Stap 1: Interesses ophalen uit het OPP**

Het systeem zoekt drie typen context op uit het OPP-document van de leerling:

```
zoekConcreteInteresses()     → gedocumenteerde interesses van de leerling
zoekIntegratieBeeld()        → karakter en integratieprofiel
zoekMotivatieEnWerkstijl()   → motivatie en werkstijl
```

Deze fragmenten worden als context meegegeven aan het taalmodel, zodat het advies aansluit bij wie de leerling is.

**Stap 2: Advies genereren via Ollama**

Het taalmodel schrijft als Juf Aimee: vriendelijk, beknopt en altijd afgesloten met een open vraag aan de leraar.

```
Signaalcontext + OPP-fragmenten + leraarnotities
    ↓
Ollama (lokaal taalmodel)
    ↓
1-2 zinnen observatie + open vraag aan leraar
```

Het gegenereerde advies wordt opgeslagen als `llm_feedback_advice` op het signaal en getoond op het dashboard.

---

## Meerdere signalen tegelijk

Wanneer een leerling meerdere actieve signalen heeft, worden deze **gecombineerd tot één samenhangend bericht** via `generateCombinedSignalAdvice()`.

**Waarom?**

Losse berichten per signaal leiden tot een lange lijst die moeilijk te lezen is. Een gecombineerd bericht verbindt de signalen en geeft de leraar één helder beeld.

**Hoe werkt het?**

```
Leerling heeft 3 signalen
    ↓
Alle signaalcontexten worden samengevoegd
    ↓
LLM schrijft één coherente observatie
    ↓
Het eerste signaal krijgt het gecombineerde advies
De overige signalen bevatten alleen de ruwe observatie
```

---

## Weergave op het dashboard

Signalen worden per leerling getoond in de `StudentCard` op `app/dashboard/page.tsx`.

**Visuele opbouw:**

```
StudentCard
├── Naam + statusbadge
├── Voortgangsbalk
├── Interesses
└── Signalen (indien aanwezig)
    ├── Gekleurde stip per signaal
    │   ├── Oranje stip  = warning
    │   ├── Blauw stip   = advice
    │   └── Groene stip  = positive
    ├── Feitelijke observatie (teacher_message)
    ├── "Juf Aimee:" + gegenereerd advies (llm_feedback_advice)
    └── Inklapbaar veld "Wat denk jij?" voor leraarnotitie
```

Signalen worden gesorteerd op prioriteit: waarschuwingen bovenaan, positieve observaties onderaan.

---

## Human in the loop: leraarnotities

De leraar kan via het dashboard een notitie toevoegen per leerling. Deze notitie wordt bij elke volgende adviesgeneratie meegenomen als **leidende context**.

Dit sluit aan op het XAI-principe: het systeem maakt zichtbaar welke informatie ten grondslag ligt aan een aanbeveling, en de leraar kan die informatie corrigeren of aanvullen.

```
Leraar voegt notitie toe
    ↓
Opgeslagen in Student.teacherNotes (database)
    ↓
Bij volgende signaalverrijking:
  notitie wordt als eerste context meegegeven aan het LLM
    ↓
Gegenereerd advies houdt rekening met wat de leraar al weet
```

---

## Dataflow overzicht

```
1. Leraar opent dashboard
       ↓
2. getDashboardStudents() haalt op:
   - Alle leerlingen met profielen
   - Alle opdrachten per leerling
       ↓
3. Per leerling:
   a) computeSignals()
      - Evalueert opdrachtenhistorie
      - Detecteert actieve patronen
      - Sorteert op prioriteit
       ↓
   b) generateSignalAdvice()
      - Haalt OPP-context op via vectorzoekopdracht
      - Roept Ollama aan voor vriendelijk advies
      - Combineert meerdere signalen indien nodig
       ↓
4. StudentCard toont:
   - Gekleurde stippen + feitelijke observatie
   - Advies van Juf Aimee
   - Inklapbaar notitieveld
       ↓
5. Leraar kan:
   - Advies lezen en zelf beslissen
   - Notitie toevoegen om toekomstige adviezen bij te sturen
```

---

## Overzicht bestanden

| Bestand | Wat het doet |
|---|---|
| `lib/signals.ts` | Kernlogica: detectie, LLM-verrijking, gecombineerde signalen |
| `app/dashboard/page.tsx` | Dashboard: laadt signalen en toont ze per leerling |
| `app/ai/tools/search_opp.ts` | OPP-zoekopdrachten voor leerlingcontext |
| `prisma/schema.prisma` | Databaseschema: `Assignment` met `bloomNiveau`, `status`, `submittedAt` |

**Sleutelfuncties in `lib/signals.ts`:**

| Functie | Doel |
|---|---|
| `computeSignals()` | Detecteert actieve signalen op basis van opdrachtenhistorie |
| `generateSignalAdvice()` | Verrijkt signalen met LLM-gegenereerd advies |
| `generateSingleSignalAdvice()` | Genereert advies voor één signaal |
| `generateCombinedSignalAdvice()` | Combineert meerdere signalen tot één bericht |

## Acceptatiecriteria

**Renzulli: Capaciteit**
- De kaart toont een signaal wanneer een leerling twee of meer opeenvolgende opdrachten op hetzelfde Bloom-niveau afrondt zonder door te groeien naar een hoger niveau
- Het signaal verdwijnt wanneer de leerling een opdracht op een hoger Bloom-niveau afrondt

**Renzulli: Taakbetrokkenheid**
- De kaart toont een signaal wanneer een leerling aan het einde van een les geen enkele opdracht heeft afgerond
- Het signaal verdwijnt zodra de leerling een opdracht volledig afrondt

**Dabrowski: Intellectueel signaal**
- De kaart toont een positief signaal wanneer een leerling consistent opdrachten op Bloom-niveau 5-6 afrondt

**Dabrowski: Psychomotorisch signaal**
- De kaart toont een signaal wanneer een leerling binnen één les drie of meer opdrachten afrondt
- Het signaal adviseert de docent: "Leerling toont hoog werktempo, overweeg extra uitdaging"

**LLM-feedback: Voltooiingstijd**
- Het systeem registreert de tijd tussen het openen en indienen van een opdracht
- Bij voltooiing onder een drempelwaarde (bijv. minder dan 3 minuten) toont de leerlingkaart een advies aan de docent: "Leerling voltooide opdracht snel, overweeg niveau omhoog"
- De voltooiingstijd wordt meegegeven aan de LLM-prompt als context bij het genereren van een nieuwe opdracht

**LLM-feedback: Signaalcontext**
- De berekende signalen van een leerling worden meegegeven aan de LLM-prompt bij het genereren van een nieuwe opdracht
- De LLM gebruikt de signalen om de moeilijkheid, het Bloom-niveau en de context van de opdracht aan te passen aan de actuele situatie van de leerling

**Algemeen**
- Elke kaart toont maximaal twee signaaliconen tegelijk
- Klikken op een signaalicoon toont een éénzin toelichting gebaseerd op aantoonbaar gedrag
- Signalen zijn uitsluitend gebaseerd op meetbaar gedrag in het systeem

## Bronnen

Renzulli, J.S. (2005). *The Three-Ring Conception of Giftedness: A Developmental Model For Promoting Creative Productivity.*

Alias, A. & Rahman, S. (2015). *Dabrowski's Overexcitabilities Profile among Gifted Students.*
