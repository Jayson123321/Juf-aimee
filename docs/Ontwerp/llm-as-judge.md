# LLM-as-Judge: Kwaliteitscontrole voor AI-gegenereerde opdrachten

Hoofdvraag:
Juf Aimee genereert een opdracht voor een leerling, maar hoe weet je of die opdracht goed genoeg is om aan het hoogbegaafde kind te geven? 


## Onzekerheden

### 1. Nu kan je niet verifiëren of de prompt altijd werkt
Een LLM is niet deterministisch - dezelfde prompt kan de ene keer een goede 
opdracht genereren en de andere keer een slechte. Zonder een judge heb je geen 
zekerheid over de kwaliteit van de output. Dit risico is extra groot omdat de 
doelgroep kinderen zijn (EU AI Act Art. 14).


## Voordelen en nadelen van een judge
### Voordelen

- Bespaart kosten en vermindert handmatig werk drastisch - Uit het onderzoek van Saha et al.(2026) beschrijven zij een praktisch scenario waarin een team 10.000 
prompt-response paren moet beoordelen. Menselijke beoordeling kost in dit 
scenario $5 per beoordeling, wat neerkomt op $50.000 in totaal. Een LLM judge 
doet hetzelfde voor $0.01 of minder per beoordeling.

- Explainability - Met LLM-as-a-judge kan de judge niet alleen een score 
geven, maar ook uitleggen waarom de gegenereerde opdracht goed of afgekeurd is. 
Dit helpt de leerkracht om de beoordeling te begrijpen en indien nodig zelf 
een beslissing te nemen.

### Nadelen

- De judge is niet altijd consistent - Een LLM is niet deterministisch. 
Dezelfde opdracht kan de ene keer een andere score krijgen dan de andere keer 
(Guo, 2025).

- De judge is zo goed als het OPP-profiel - Als de leerkracht het 
OPP-profiel niet regelmatig bijwerkt, kan de judge beoordelen op basis 
van verouderde informatie. De kwaliteit van de beoordeling is dus 
afhankelijk van hoe actueel de leerkracht het profiel houdt. De leerkracht 
is daarom verantwoordelijk voor het regelmatig updaten van het profiel 
wanneer zij veranderingen ziet in bijvoorbeeld de interesses of het 
niveau van het kind (EU AI Act Art. 14).

#### bronnen
- Saha et al. (2026). *LLM-as-a-Judge on a Budget*. arXiv:2602.15481. 
  Geraadpleegd via https://arxiv.org/html/2602.15481v1#S6

- Guo, S. (2025). *LLM-as-a-Judge: A Practical Guide*. Towards Data Science. 
  Geraadpleegd via https://towardsdatascience.com/llm-as-a-judge-a-practical-guide/

## Een evaluatierubric voor de judge 
Zonder evaluatierubric: de judge-AI krijgt een opdracht en zegt vaag "dit is goed" of "dit is slecht", maar niemand weet waarom, en je kunt het niet controleren of verbeteren.

Met rubric: de judge-AI scoort de opdracht op 7 meetbare criteria (1–5), geeft per criterium een onderbouwing, en de beslislogica bepaalt automatisch wat er gebeurt. Transparant, controleerbaar, en uitlegbaar aan een leerkracht.


```
Juf Aimee genereert opdracht → Judge scoort op rubric → Beslislogica zegt goedkeuren / flaggen / opnieuw genereren → Leerkracht ziet het resultaat
```
![llm-as-judge-image](images/llm-as-judge-image.jpg)
## Evaluatiepipeline

```mermaid
flowchart TD
    A[Leerkracht vraagt opdracht aan] --> B[Agent haalt OPP-chunks op via search_opp]
    B --> C[llm genereert opdracht]
    C --> D[Judge beoordeelt op 7 criteria]
    D --> E{Genormaliseerde score?}
    E -- ">= 0.7 goedkeuren" --> J[Toon opdracht aan leerkracht]
    J --> K{Leerkracht beslist}
    K -- Goedkeuren --> L[Opdracht toegewezen aan leerling]
    K -- Afkeuren --> M[Leerkracht geeft reden]
    M --> N[Reden opgeslagen in OPP als feedback]
    E -- "0.5 – 0.7 flaggen" --> O[Toon opdracht met waarschuwing welke criteria laag scoren]
    O --> K
    E -- "< 0.5 opnieuw genereren" --> G{Nog een poging mogelijk? max 2}
    G -- Ja --> R[Vertaal slechte criteria naar verbeterpunten]
    R --> S[Geef verbeterpunten + vorige opdracht mee aan generator]
    S --> C
    G -- Nee --> J
```

---
### Welke llms zijn hiervoor getraind? 
- JudgeLm
- Prometheus 2

#### Prometheus 2 
- Base model: Mistral-7B-Instruct-v0.2

Speciaal finegetuned om andere llms te beoordelen op basis van een rubric. 

Uit het onderzoek van Kim et al. (2024) - "Prometheus 2: An Open Source Language Model Specialized in Evaluating Other Language Models"

![De twee evaluatiemethoden van Prometheus 2: paarsgewijze vergelijking vs. directe beoordeling](images/direct-assesment-and-pairwise-ranking.png)

Onderzoek prompt template:

![Prometheus 2 onderzoek, kant en klare prompt templates](images/direct-assesment-prompt-template.png)

Juf aimee judge prompt:
1. Leerling profiel
2. Gegenereerde opdracht
3. Rubric 

#### Bronnen
Prometheus 2: https://arxiv.org/abs/2405.01535
### Judge prompt

Per criterium wordt de volgende promptstructuur gebruikt (Prometheus-2 raw format via `ollama.generate()`):

```
[INST] You are a fair judge assistant tasked with providing clear, objective feedback
based on specific criteria, ensuring each assessment reflects the absolute standards
set for performance.

###Task Description:
1. Write detailed feedback (2-4 sentences) based strictly on the score rubric.
2. After writing feedback, write a score between 1 and 5.
3. Output format: "Feedback: (feedback) [RESULT] (score)"
4. Do not generate any other opening, closing, or explanations.

###The instruction to evaluate:
Criterion: <criterium naam>

Structured student profile:
<profielSamenvatting — Engels, gedestilleerd uit OPP>

Supporting OPP excerpts (Dutch source document):
<ruwe OPP-tekst>

###Response to evaluate:
<gegenereerde opdracht>

###Reference Answer:
<referentieantwoord per criterium>

###Score Rubrics:
Score 1: ...  Score 5: ...

###Feedback: [/INST]
```

De `profielSamenvatting` is een gestructureerde Engelse samenvatting van het OPP (gebouwd door `buildProfileSummary` in `route.ts`), omdat Prometheus-2 een Engels-eerst model is en ruwe Nederlandse OPP-tekst moeilijker verwerkt. Per criterium worden **3 runs** gedraaid en gemiddeld — dit stabiliseert de score en corrigeert uitbijters.
### RAGAS 
Retrieval Augmented Generation Assesment

### Evaluatierubric opstellen

| # | Criterium | Type | Bron |
|---|---|---|---|
| 1 | Zijn alle elementen in de opdracht terug te herleiden naar het leerlingprofiel, zonder verzonnen info? | RAGAS | Es et al., 2023 — faithfulness metric |
| 2 | Gebruikt de opdracht alleen relevante leerlinginfo en laat het irrelevante details weg? | RAGAS | Es et al., 2023 — context precision metric |
| 3 | Weerspiegelt de opdracht alle relevante profielkenmerken, inclusief sterke punten én gedocumenteerde beperkingen? | RAGAS | Es et al., 2023 — context recall metric |
| 4 | Bevat de opdracht elementen die aansluiten op de interesses die in het leerlingprofiel staan? | Onderwijsspecifiek | Renzulli SEM (1977) + Self-Determination Theory (Ryan & Deci, 2000) |
| 5 | Past de cognitieve moeilijkheidsgraad van de opdracht bij het opgegeven Bloom-niveau van de leerling? | Onderwijsspecifiek | Bloom's Taxonomy (Anderson & Krathwohl, 2001) |
| 6 | Kan een leerling van deze leeftijd en dit niveau de opdracht zelfstandig uitvoeren? | Onderwijsspecifiek | Vygotsky ZPD (1978) + Reis & Renzulli (2010) |
| 7 | Is de opdracht leeftijdspassend in taalgebruik, toon en inhoud voor dit kind? | Onderwijsspecifiek | Piaget (1972) + Silverman (1997) |

## Implementatie

### Geïmplementeerde criteria

De judge (`lib/judge.ts`) scoort elke gegenereerde opdracht op 7 criteria, elk op een schaal van 1–5:

| # | Criterium | Bron |
|---|-----------|------|
| 1 | Zijn alle elementen traceerbaar naar het OPP, zonder verzonnen info? | RAGAS Faithfulness (Es et al., 2023) |
| 2 | Gebruikt de opdracht alleen relevante leerlinginfo? | RAGAS Context Precision (Es et al., 2023) |
| 3 | Weerspiegelt de opdracht alle relevante profielkenmerken, inclusief beperkingen? | RAGAS Context Recall (Es et al., 2023) |
| 4 | Bevat de opdracht elementen die aansluiten op de interesses uit het profiel? | Renzulli SEM (1977) + SDT (Ryan & Deci, 2000) |
| 5 | Past de cognitieve moeilijkheidsgraad bij het opgegeven Bloom-niveau? | Anderson & Krathwohl (2001) |
| 6 | Kan de leerling de opdracht zelfstandig uitvoeren? | Vygotsky ZPD (1978) + Reis & Renzulli (2010) |
| 7 | Is de opdracht leeftijdspassend in taal, toon en inhoud? | Piaget (1972) + Silverman (1997) |

Per criterium bouwt de judge een aparte prompt op in Prometheus-2 format en roept `ollama.generate()` aan (niet `ollama.chat()` — de Llama-2 chat template veroorzaakt bij Prometheus direct EOS).

### Beslislogica

De genormaliseerde score (totaal gedeeld door maximum) bepaalt de beslissing:

| Score | Beslissing | Betekenis |
|-------|-----------|-----------|
| ≥ 0.7 | `goedkeuren` | Opdracht wordt getoond aan leerkracht |
| 0.5 – 0.7 | `flaggen` | Opdracht wordt getoond met waarschuwing welke criteria laag scoren |
| < 0.5 | `opnieuw_genereren` | Systeem genereert automatisch een nieuwe poging |

### Feedbackloop bij opnieuw genereren

Als de score onder 0.5 valt, genereert het systeem automatisch een tweede poging — maar de generator krijgt dan gerichte feedback mee zodat hij weet wat er mis was.

**Hoe het werkt (`app/api/assign/route.ts`):**

1. De judge scoort de opdracht op alle 7 criteria
2. Criteria met een score ≤ 2 worden vertaald naar concrete Nederlandse verbeterpunten (`buildJudgeFeedback`)
3. De vorige (mislukte) opdracht wordt meegegeven als `currentAssignment`
4. De verbeterpunten worden als extra sectie in de generator-prompt gezet:

```
VERBETERPUNTEN UIT VORIGE VERSIE:
- De opdracht sluit niet aan op de gedocumenteerde interesses. Verwerk de interesses als kern van de opdracht, niet als decoratie.
- Het cognitieve niveau klopt niet met Bloom-niveau "Creëren". ontwerpen, construeren, samenstellen — de leerling MAAKT iets nieuws dat nog niet bestond.
```

De generator ziet dit als instructies van de leerkracht — er wordt niet vermeld dat een judge dit heeft bepaald. Criteria met score ≥ 3 worden niet genoemd; die waren goed genoeg.

**Maximum 2 pogingen.** Als na de tweede poging de score nog steeds onder 0.5 ligt, wordt de beste versie toch getoond aan de leerkracht.

---

## Volgende stappen 
Pairwise Ranking prompt zodat er twee opdrachten met elkaar vergeleken kunnen worden.
 
## Wetenschappelijke Bronnen

- **LLM-as-judge**: Zheng et al. (2023) — https://arxiv.org/abs/2306.05685
- **G-Eval**: Liu et al. (2023) — https://arxiv.org/abs/2303.16634
- **RAGAS**: Es et al. (2023) — https://arxiv.org/abs/2309.15217

- Basisboek (Hoog)begaafdheid voor po en vo: 

## bronnen
- https://towardsdatascience.com/llm-as-a-judge-a-practical-guide/


## Tests 

### Wat maakt een goede opdracht voor Noah Smit?

Op basis van zijn OPP (groep 6) zijn de belangrijkste factoren:

- Sluit aan op zijn interesse in **wetenschap en experimenten**
- Biedt **autonomie** en ruimte voor eigen keuzes
- Is **cognitief uitdagend**: open vragen, eigen redenering, iets nieuws produceren
- Heeft **duidelijke tussenstappen**: planning van grote taken vraagt nog sturing
- Vraagt **geen zwaar schrijfwerk** als doel op zich
- Bevat **geen herhaalwerk of routinetaken**: Noah haakt af en werkt slordig bij gebrek aan uitdaging
- Is **individueel uitvoerbaar**: samenwerken is nog een ontwikkelpunt voor Noah

```
Titel: Ontwerp je eigen weersysteem-experiment

Noah, jij wordt klimaatwetenschapper. Kies één klimaatzone op aarde (bijv.
woestijn, tropisch regenwoud of toendra) en doe onderzoek naar waarom het
daar zo regent — of juist niet.

Stap 1 — Formuleer een hypothese
Bedenk een verklaring: waarom valt er in jouw gekozen klimaatzone zo veel of
zo weinig neerslag? Schrijf dit op als een echte wetenschappelijke hypothese
("Ik denk dat... omdat...").

Stap 2 — Test je hypothese met data
Zoek klimaatdata op (temperatuur, neerslag, wind) van jouw zone. Vergelijk
minstens twee maanden met elkaar. Klopt jouw hypothese? Pas hem aan als dat
nodig is.

Stap 3 — Ontwerp een experiment
Beschrijf een experiment dat je in de klas zou kunnen uitvoeren om één aspect
van jouw klimaatzone na te bootsen (bijv. verdamping, condensatie,
regenschaduw). Wat heb je nodig? Wat meet je? Wat verwacht je te zien?

Eindproduct: een onderzoeksverslag met hypothese, data-analyse en
experimentontwerp.
```
#### Testresultaten

Getest met `scripts/test-judge.ts` — model: `tensortemplar/prometheus2:7b-fp16`, `runs=3` per criterium.
Volledige rapporten: `docs/judge-testrapport-2026-05-02T*.txt`

Gemiddelde scores over 3 testruns (2026-05-02):

| Criterium | Goede opdracht | Slechte opdracht | Verschil |
|-----------|---------------|-----------------|---------|
| C1 — Faithfulness | 3/5 | 1/5 | +2 |
| C2 — Context Precision | 4–5/5 | 2/5 | +2–3 |
| C3 — Context Recall | 2/5 | 1/5 | +1 |
| C4 — Interesses | 4/5 | 1/5 | +3 |
| C5 — Bloom-niveau | 5/5 | 1–2/5 | +3–4 |
| C6 — Zelfstandig uitvoerbaar | 5/5 | 2–4/5 | +1–3 |
| C7 — Leeftijdspassend | 4–5/5 | 1–2/5 | +2–4 |
| **Totaal** | **27–28/35 (77–80%)** | **8–12/35 (23–34%)** | |
| **Beslissing** | **goedkeuren** | **opnieuw_genereren** | |

---

### Wat maakt een slechte opdracht voor Noah Smit?

- **Geen aansluiting heeft op zijn interesses**: niets met wetenschap of experimenten
- **Passief en gesloten is**: één correct antwoord, geen eigen redenering
- **Herhaalwerk of routinewerk vraagt**: Noah haakt af en werkt slordig
- **Geen autonomie biedt**: alles ligt vast, geen eigen keuzes
- **Niet terug te herleiden is naar zijn OPP**: elk kind had deze opdracht kunnen krijgen

```
Titel: Landen kleuren

Kleur de landen van Europa in op de kaart. Gebruik verschillende kleuren.
Schrijf bij elk land de hoofdstad op. Maak het mooi en netjes. Zorg dat je
binnen de lijnen kleurt.
```

#### Testresultaten

Gemiddelde scores over 3 testruns (2026-05-02):

| Criterium | Score | Runs (voorbeeld) | Opmerkingen |
|-----------|-------|-----------------|------------|
| C1 — Faithfulness | 1/5 | 1, 1, 1 | Zeer stabiel — geen profiel gebruikt |
| C2 — Context Precision | 2/5 | 1, 1, 5 | Uitbijters: judge geeft soms 5/5 ten onrechte |
| C3 — Context Recall | 1/5 | 1, 1, 1 | Zeer stabiel |
| C4 — Interesses | 1/5 | 1, 1, 1 | Zeer stabiel |
| C5 — Bloom-niveau | 1–2/5 | 1, 5, 1 | Uitbijters bij C5 |
| C6 — Zelfstandig | 2–4/5 | 2, 5, 5 | Logisch: simpele taak IS uitvoerbaar |
| C7 — Leeftijdspassend | 1–2/5 | 1, 1, 1 | Stabiel |
| **Totaal** | **9–12/35 (26–34%)** | | **→ opnieuw_genereren** |

---

### Bevindingen en conclusies

#### Beslislogica werkt correct
De judge discrimineert betrouwbaar tussen goed en slecht:
- Slechte opdracht: consistent 23–34% → altijd `opnieuw_genereren`
- Goede opdracht: consistent 77–80% → altijd `goedkeuren`

#### Runs=3 stabiliseert de beslissing
Met `runs=1` (vorige versie) scoorde de goede opdracht soms 65.7% → `flaggen`. Met `runs=3` is de beslissing stabiel op `goedkeuren`. De middeling over drie runs corrigeert uitbijters.

#### Meest betrouwbare criteria: C5 en C6
Runs van `5,5,5` — de judge is het hier altijd over eens. Bloom-niveau en zelfstandige uitvoerbaarheid zijn goed te beoordelen.

#### Minst betrouwbare criteria: C1 en C2
- **C1** (Faithfulness): runs zoals `4, 1, 5` op dezelfde goede opdracht — maximale spreiding. De judge is het fundamenteel oneens met zichzelf.
- **C2** (Context Precision): soms geeft de judge 5/5 op de slechte opdracht (`1, 5, 1`), terwijl die opdracht geen enkele leerlinginformatie gebruikt. Dit is een duidelijke judge-fout die `runs=3` via middeling corrigeert.

#### C3 scoort structureel laag op de goede opdracht (2/5) — terecht
De judge wijst er consistent op dat het eindproduct een onderzoeksverslag vereist, terwijl Noah moeite heeft met schrijven. Dit is een valide kritiekpunt op de goede opdracht zelf, niet op de judge.

#### Niet-determinisme is inherent
LLM-judges zijn niet deterministisch bij `temperature: 1.0` (vereist door Prometheus 2). Dezelfde opdracht kan per run anders scoren. `runs=3` vermindert dit effect significant; `runs=5` zou C2 verder stabiliseren maar verdrievoudigt de evaluatietijd.

### Tests bij 'goede' opdrachten voor hoogbegaafde leerlingen

Een 'goede' opdracht voor Noah sluit aan op zijn interesses, geeft autonomie, vraagt eigen redenering en is volledig traceerbaar naar zijn OPP.

#### Test 1 
[text](llm-as-judge.md) ![text](images/judge-test-1-selectie.png) ![text](images/judge-test-1-opdracht.png) ![text](images/judge-test-1-beoordeling-1.png) ![text](images/judge-test-1-beoordeling-2.png)

#### Test 2 
![alt text](images/judge-test-2-selectie.png) ![alt text](images/judge-test-2-opdracht.png) ![alt text](images/judge-test-2-beoordeling-1.png) ![alt text](images/judge-test-2-beoordeling-2.png)
