# Dashboard & Studentpagina
**Juf Aimee — Studio Responsible AI | Sprint 2**

---

## Inleiding

Uit onze analyse van Khanmigo en de Microsoft HAX Guidelines bleek 
een probleem: bestaande AI-onderwijstools zijn gebouwd als tools, niet als samenwerkingspartners. De leraar moet altijd zelf het initiatief nemen, de AI onthoudt niets tussen sessies, en legt nooit uit waarom het iets doet. Dit ondermijnt de regie van de leraar in plaats van die te versterken.

Dit advies beantwoordt de vraag: hoe moet het dashboard eruitzien zodat mens en AI elkaar versterken, zonder dat de AI de leraar overneemt?

---

## Gebruikte frameworks

**Microsoft HAX Guidelines** - 18 op bewijs gebaseerde richtlijnen voor gebruiksgerichte en verantwoorde AI-systemen. Gekozen omdat dit framework specifiek gaat over hoe een gebruiker in controle blijft. Wetenschappelijk onderbouwd door Microsoft Research op basis van 20+ jaar onderzoek.

**Google PAIR Guidebook** - richtlijnen van Google voor mensgerichte AI-producten. Gekozen omdat dit framework ingaat op hoe mensen en AI van elkaar kunnen leren over tijd. Dit sluit direct aan op de centrale vraag: hoe blijft de leraar de baas terwijl Juf Aimee zich aanpast?

---

## Analyse: Khanmigo

Khanmigo is niet speciaal gericht op hoogbegaafde kinderen, maar heeft de samenwerking tussen leraar en AI expliciet vormgegeven — daardoor een relevante casus.

| Criterium | Bevinding |
|-----------|-----------|
| (G1) Maakt de AI duidelijk wat het wel/niet kan? | Ja — "You're the expert", "Double check for accuracy" |
| (G2) Maakt de AI duidelijk hoe goed het presteert? | Ja — "I sometimes make mistakes", "This answer key may contain mistakes" |
| (G7) Kan de leraar de AI makkelijk corrigeren? | Ja — thumbs-down knop en bijsturen via chat |
| (G8) Legt de AI uit waarom het iets heeft gedaan? | Nee — geen referentie aan Bloom of andere redenering |
| (G13) Gaat de AI netjes om met wat het niet weet? | Deels — gaat door ook bij onzinnige input |
| (G16) Kan de leraar globaal het AI-gedrag instellen? | Nee — geen AI-gedragsinstellingen in account |
| Feedback + Controls — Leert de AI van de leraar? | Ja — thumbs-down en "Leave feedback" knop |
| Feedback + Controls — Onthoudt de AI keuzes? | Nee — begint elke sessie opnieuw vanaf nul |
| Feedback + Controls — Geeft de AI uitleg over keuzes? | Nee — alleen "I've drafted some questions for you" |
| Mental Models — Leert de leraar de AI begrijpen? | Deels — via natuurlijke taal aansturen werkt laagdrempelig |

**Conclusie analyse:** Khanmigo is een tool, geen collega. De leraar bedient de AI — de AI bedient de leraar niet terug. Juf Aimee moet dit dus anders aanpakken.

---

## Dashboard (overzichtspagina)

De overzichtspagina is het moment waarop de leraar en de AI elkaar ontmoeten. Het doel is niet zoveel mogelijk data tonen, maar de leraar in één oogopslag laten zien waar actie nodig is en die actie direct mogelijk maken.

**Een overzicht van leerlingen met actieve AI-signalen zoals patroonherkenning over tijd**
Molenaar & Knoop-van Campen (2019): leraren handelen pas op dashboardinformatie als die direct koppelbaar is aan een concrete actie. Maatschappelijk: leerlingen die extra aandacht nodig hebben worden eerder opgemerkt, wat onderwijsongelijkheid kan verminderen. Siegle & McCoach (2005) tonen aan dat hoogbegaafde leerlingen uitdaging vermijden wanneer ze niet zeker zijn van succes, dit gedrag is zichtbaar in keuzepatronen over tijd, niet in toetsscores.

**Per signaal een korte uitleg waarom de AI dit markeert**
Uit de Khanmigo-analyse bleek dat de AI nooit uitlegt waarom het iets doet, dit is het grootste gat. HAX G8: zonder uitlegbaarheid is er geen echte samenwerking, alleen blinde opvolging. Maatschappelijk: transparantie over AI-beslissingen beschermt leerlingen tegen ondoorzichtige profilering en is een vereiste onder de AVG.

**Een goedkeurings en afwijzingsknop per suggestie**
Khanmigo wacht altijd op de leraar maar handelt dan autonoom. Juf Aimee doet dit anders: proactief initiatief, maar de leraar beslist altijd. HAX G1: niets bereikt een leerling zonder expliciete goedkeuring. Maatschappelijk: de leraar blijft verantwoordelijk — AI kan die verantwoordelijkheid niet overnemen.

**Een Bloom-streefniveau instelling per leerling**
Molenaar (2022): de leraar is beter in pedagogische beslissingen dan de AI. Door het streefniveau in te stellen bepaalt de leraar de kaders waarbinnen de AI werkt — niet andersom. Maatschappelijk: voorkomt dat de AI leerlingen in een vast niveau houdt, wat kansen op groei blokkeert.


** 
---

## Studentpagina (individuele leerling)

De studentpagina is waar de samenwerking het meest concreet wordt. De AI laat zien wat het heeft geleerd over een leerling, de leraar vult aan, corrigeert en keurt goed. Zonder deze wisselwerking is Juf Aimee een tool, met deze wisselwerking is het een collega.

**Een tijdlijn van Bloom-niveaus over tijd**
College voor de Rechten van de Mens (2024): waarschuwt voor labeling door AI. Een tijdlijn toont voortgang in plaats van een vast label. Maatschappelijk: permanente labeling verlaagt de verwachtingen van leraren structureel, met langdurige gevolgen voor onderwijskansen.

**Een invoerveld waar de leraar observaties kan noteren**
Molenaar (2022): de leraar is beter in het interpreteren van context dan de AI. Dit veld is de plek waar contextuele kennis het systeem binnenkomt. Maatschappelijk: zorgt dat persoonlijke omstandigheden meewegen in AI-beslissingen.

**Per AI-suggestie de redenering zichtbaar**
Uit de Khanmigo-analyse bleek dat de AI alleen zegt "I've drafted some questions", zonder enige toelichting. Van Kessel et al. (2025): effectief dashboardgebruik vereist vaardigheden om data te interpreteren. Door de redenering te tonen leer je de leraar de AI begrijpen zonder dat die AI-expert hoeft te worden. Maatschappelijk: leraren kunnen controleren of de AI geen ongelijke kansen creëert.

- **Opdrachtsuggesties** — welke oefening past nu bij dit Bloom-niveau en deze toetsdata?
- **Interventiesuggesties** — wanneer een leerling structureel moeite heeft. Molenaar (2022): patroonherkenning over tijd is waar de AI sterker in is dan de leraar.
- **Tijdstip- of groeperingssuggesties** — correlaties in leerlingdata die de leraar over 25 leerlingen niet bewust kan bijhouden.

**Een aanpasknop per opdrachtsuggestie**
Khanmigo biedt alleen een thumbs-down — niet de mogelijkheid om aan te passen. HAX G7: de leraar kan altijd corrigeren. Maatschappelijk: voorkomt dat leerlingen verkeerde opdrachten krijgen puur omdat ingrijpen te omslachtig was.

**Een log van eerder afgewezen suggesties**
Khanmigo onthoudt niets — leren is daardoor onmogelijk. Molenaar (2022): een hybride systeem wordt beter naarmate mens en AI meer samenwerken. Dit log maakt zichtbaar of de AI daadwerkelijk bijleert. Maatschappelijk: maakt het leerproces van de AI controleerbaar en auditeerbaar.

---

## Conclusie

Juf Aimee moet niet gebouwd worden als een slimmere versie van Khanmigo. Het verschil is dat Juf Aimee een persistent geheugen opbouwt, proactief signaleert en altijd uitlegt waarom. De leraar blijft de baas, maar de AI is een echte samenwerkingspartner die over tijd beter wordt door wat de leraar teruggeeft. Dat is het verschil tussen een tool en een collega.

---


## Bronnen

- College voor de Rechten van de Mens (2024). *Algoritmen in het onderwijs.* KBA Nijmegen / ResearchNed.
- Microsoft Research (2019). *Guidelines for Human-AI Interaction (HAX).*
- Molenaar, I. (2022). Towards hybrid human–AI learning technologies. *European Journal of Education,* 57(4), 632–645.
- Molenaar, I. & Knoop-van Campen, C.A.N. (2019). How teachers make dashboard information actionable. *IEEE Transactions on Learning Technologies,* 12(3), 347–355.
- Van Kessel, M., Molenaar, I. et al. (2025). Primary school teacher perspectives on effective dashboard use. *Journal of Learning Analytics,* 12(2), 279–292.
- Siegle, D. & McCoach, D.B. (2005). Making a difference: Motivating gifted students who are not achieving. Teaching Exceptional Children, 38(1), 22–27.