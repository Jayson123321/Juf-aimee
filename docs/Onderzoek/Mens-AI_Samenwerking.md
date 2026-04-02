# Analysetabel: Mens-AI Samenwerking

**Juf Aimee — Studio Responsible AI | Sprint 2**

---

## Onderzoeksvraag
Hoe geven bestaande LLM-assistenten de samenwerking tussen AI en leraar vorm, zodat Juf Aimee de leraar kan ondersteunen en de leraar de baas blijft?
---

## Gebruikte frameworks

### Microsoft HAX Guidelines
Dit framework zijn een set van 18 op bewijs gebasseerde richtlijnen om een gebruiksgerichte en verantwoorde AI systemen te bouwen. Gekozen omdat dit framework specifiek gaat over hoe een gebruiker in controle blijft tijdens het gebruik van een AI-systeem. Het is wetenschappelijk onderbouwd en gevalideerd door Microsoft Research op basis van 20+ jaar onderzoek. 

### Google PAIR Guidebook
Dit framework is een verzameling richtlijnen van Google voor het ontwerpen van mensgerichte AI producten, gebaseerd op inzichten van honderden onderzoekers en industrie experts.
Gekozen omdat dit framework specifiek ingaat op hoe mensen en AI van elkaar kunnen leren over tijd. Dit sluit direct aan op de centrale vraag: hoe blijft de leraar de baas terwijl Juf Aimee zich aanpast?


---

## Bestaande oplossingen

### Khanmigo
Khanmigo is niet speciaal gericht op hoogbegaafde kinderen, maar is wel een AI-onderwijsassistent die de samenwerking tussen leraar en AI expliciet heeft vormgegeven, waardoor het een relevante casus is om te onderzoeken hoe Juf Aimee de leraar kan ondersteunen zonder diens regie over te nemen.

### MagicSchool AI


---

## Analyse 
| Criterium | Khanmigo | MagicSchool AI |
|-----------|----------|----------------|
| **Microsoft HAX Guidelines — leraar in controle** | | |
| (G1) Maakt de AI duidelijk wat het wel en niet kan doen? | Ja — Khanmigo maakt dit op meerdere momenten duidelijk: bij de eerste popup bij de Question Generator: "You're the expert", in de sidebar "I use AI to help you teach and support your students", en bovenaan elke tool staat "Double check for accuracy". | |
| (G2) Maakt de AI duidelijk hoe goed het presteert? | Ja — Khanmigo is transparant over zijn beperkingen op meerdere plekken: "I'm still pretty new, so I sometimes make mistakes" in de sidebar, "This answer key may contain mistakes" bij de output, en "If you see Khanmigo make a mistake, tap the Thumbs Down icon" bij de eerste popup.| |
| (G7) Kan de leraar de AI makkelijk corrigeren? | Ja — Bij de tool: Question Generator: "If you see Khanmigo make a mistake, tap the Thumbs Down icon en de leraar kan via de ai assistant chat direct zeggen dat de vragen niet goed zijn en nieuwe laten genereren.
| |
| (G8) Legt de AI uit waarom het iets heeft gedaan? |Nee —  Bij het genereren van vragen vult de leraar zelf het grade level, hoeveelheid vragen en de tekst in als input. De AI baseert zich dus op wat de leraar aanlevert, maar legt niet uit waarom het deze specifieke vragen heeft gekozen. Er is geen referentie aan bijvoorbeeld de Taxonomie van Bloom.
   | |
| (G13) Gaat de AI netjes om met dingen die het niet weet? |Khanmigo Question Generator genereert toch vragen en antwoorden, ook bij onzintekst. Het geeft wel eerlijk aan in de antwoordsleutel dat de tekst geen betekenis heeft ("the text appears to be random letters"), maar weigert de taak niet. Het gaat dus door ook als de input zinloos is.
 | |
| (G16) Kan de leraar globaal instellen wat de AI doet? |In de accountinstellingen zijn er geen specifieke Khanmigo AI instellingen. De leraar kan wel algemene dingen instellen zoals taal, rol (leraar/coach) en of de klas mag meedoen aan onderzoek ("My classes may participate in research for product improvement"). Er is geen optie om het gedrag van de AI zelf globaal aan te passen.
 | |
| (G17) Wordt de leraar op de hoogte gesteld als de AI iets verandert? | | |
| **Google PAIR Guidebook — leren van elkaar** | | |
| Feedback + Controls — Hoe leert de AI van de leraar? |Ja — Bij de Question Generator zowel vooraf via de disclaimer "It'll learn to get better via the thumbs down button!" als achteraf via de "Leave feedback" knop.
 | |
| Feedback + Controls — Heeft de leraar controle over wat de AI onthoudt? |Nee — Khanmigo onthoudt niets tussen sessies. Na het sluiten van de tool begint de AI weer vanaf nul. De leraar moet elke keer opnieuw grade level, hoeveelheid vragen en input invullen. Getest door de tool te sluiten en opnieuw te openen, en door Khanmigo direct te vragen: "Do you remember our previous conversations?" waarop de AI zelf antwoordde: "I don't have access to previous conversations once our chat ends". | |
| Feedback + Controls — Geeft de AI expliciete uitleg over zijn keuzes? | Nee — Bij de Question Generators zegt de AI alleen "OK! I've drafted some questions and answers for you. Let me know if you have any questions!" zonder verdere toelichting.
| |
| Feedback + Controls — Kan de leraar meerdere AI-suggesties vergelijken en kiezen? | Gedeeltelijk — de leraar kan nieuwe versies opvragen via de chat, maar de oude en nieuwe versies staan niet automatisch naast elkaar. Je moet zelf scrollen om te vergelijken.| |
| Mental Models + Expectations — Hoe leert de leraar de AI beter begrijpen over tijd? |De AI chat interface leert de leraar dat je Khanmigo gewoon kunt aansturen via natuurlijke taal, dat is een laagdrempelige manier om de AI te begrijpen. | |

---

## Resultaten
![Khanmigo homepage list of tools for the teacher](images/khanmigo_homepage_tools.png)
![Khanmigo Question Generator page select: Grade level, number questions, Text input](images/khanmigo_question_generator.png)
![Khanmigo generated questions with answers with AI assistant Chat on the right](images/khanmigo_generatedQA_with_ai_assistant.png)

## Conclusie & Advies

### Wat Khanmigo goed doet en Juf Aimee moet overnemen

Khanmigo herhaalt consistent *"You're the expert"* op meerdere momenten bij de eerste popup, in de sidebar en bij elke output. Dit is geen toevallige keuze maar een bewust ontwerpprincipe. Juf Aimee moet dit overnemen: de leraar is altijd de eindverantwoordelijke en dat moet voelbaar zijn door de hele tool heen.

Daarnaast werkt de AI chatinterface van Khanmigo goed, de leraar kan in eigen woorden bijsturen (*"These questions are not good enough, generate new ones"*) en de AI reageert direct. Dit is een laagdrempelige manier voor leraren om de AI aan te sturen.

### Waar Juf Aimee het beter moet doen

Khanmigo is uiteindelijk een tool, de leraar moet altijd zelf een tool opstarten, input invullen en op start drukken. De AI doet nooit iets automatisch en onthoudt niets tussen sessies. Dit maakt Khanmigo meer een tool dan een echte collega.

Juf Aimee moet hier tussenin zitten:

- Proactief maar niet automatisch: Juf Aimee signaleert en suggereert, maar de leraar keurt altijd goed voordat een leerling iets ziet.
- Geheugen: Juf Aimee bouwt een leerlingprofiel op over tijd zodat opdrachten steeds beter aansluiten, in plaats van elke sessie opnieuw beginnen.
- Transparantie over waarom: Khanmigo legt niet uit waarom het bepaalde vragen genereert. Juf Aimee moet dit wel doen, bijvoorbeeld: *"Deze opdracht is gekozen omdat deze leerling toe is aan Analyseren (Bloom niveau 4)"*.

### Kernverschil samengevat

| | Khanmigo | Juf Aimee |
|---|---|---|
| Initiatief | Altijd de leraar | Beiden kunnen initiatief nemen |
| Geheugen | Geen. begint elke sessie opnieuw | Onthoudt leerlingprofiel over tijd |
| Uitleg | Geen referentie aan Bloom | Legt uit waarom op basis van Bloom |
| Rol leraar | Bedient de AI | Werkt samen met de AI |


## 6. Wetenschappelijke onderbouwing: mens AI samenwerking

De centrale vraag van dit onderzoek is hoe Juf Aimee de leraar kan
ondersteunen zonder diens regie over te nemen. De wetenschap biedt hiervoor
drie complementaire perspectieven: hoe AI en mens elkaars sterktes aanvullen
(complementariteit), hoe zij samen leren over tijd (hybride samenwerking), en
hoe de controle verdeeld wordt (gedeelde regie).

---

### 6.1 Human-AI Complementarity: sterktes aanvullen, niet vervangen

**Molenaar, I. (2022). Towards hybrid human–AI learning technologies.
*European Journal of Education,* 57(4), 632–645.**

**TAICo — Teacher-AI Complementarity Consortium (Molenaar / NOLAI, lopend).**

Molenaar introduceert het concept van Human-AI Complementarity: mens en AI
zijn het meest effectief wanneer zij elkaars sterktes aanvullen in plaats van
elkaars taken overnemen. De AI is beter in het continu monitoren van
leerlingdata en het herkennen van patronen over tijd. De leraar is beter in
het interpreteren van context, het bouwen van een vertrouwensrelatie met de
leerling, en het nemen van pedagogische beslissingen.

Toepassing voor Juf Aimee:

- De AI monitort continu (18 minuten vastgelopen, 2 opdrachten overgeslagen)
  — taken die de leraar met een volle klas niet kan bijhouden
- De leraar interpreteert de context en beslist (hint sturen of zelf spreken)
  — een beslissing die de AI niet kan nemen zonder relationele kennis
- Het dashboard is de plek waar deze twee sterktes samenkomen

Het gevaar van niet-complementaire systemen is dat de AI taken overneemt
waarvoor de leraar juist onmisbaar is, zoals het opbouwen van vertrouwen met
een leerling. Juf Aimee is daarom bewust ontworpen als signalerings- en
suggestiesysteem, niet als autonoom handelend systeem.

---

### 6.2 Hybrid Human-AI Learning Technologies: samen leren over tijd

**Molenaar & Knoop-van Campen (2019). *How Teachers Make Dashboard Information
Actionable.* IEEE Transactions on Learning Technologies, 12(3), 347–355.**

**Van Kessel, Molenaar et al. (2025). *Primary School Teacher Perspectives on
Effective Dashboard Use.* Journal of Learning Analytics, 12(2), 279–292.**

**Knoop-van Campen & Molenaar (2020). *How Teachers Integrate Dashboards into
Their Feedback Practices.* Frontline Learning Research, 8(4), 37–51.**

Een hybride mens-AI systeem wordt beter naarmate mens en AI meer met elkaar
samenwerken. Dit vereist twee dingen: de AI moet leren van de keuzes van de
leraar, en de leraar moet leren hoe de AI redeneert. Beide kanten van dit
leerproces moeten expliciet worden ontworpen.

**De AI leert van de leraar:**

Elke goedkeuring, afwijzing of aanpassing door de leraar is een signaal dat de
AI gebruikt om het leerlingprofiel te verfijnen. Khanmigo doet dit niet — het
begint elke sessie opnieuw. Juf Aimee bouwt een persistent leerlingprofiel op
zodat opdrachten over tijd steeds beter aansluiten.

**De leraar leert de AI begrijpen:**

Van Kessel et al. (2025) toonden aan dat effectief dashboardgebruik drie
condities vereist: vaardigheden om data te interpreteren, domeinkennis om
AI-suggesties te beoordelen, en contextuele omstandigheden die gebruik
faciliteren. Het dashboard is daarom zo ontworpen dat de leraar niet eerst
AI-expert hoeft te worden: elke suggestie bevat een uitleg in Bloom-termen die
de leraar al kent.

**Wat dit betekent voor de goedkeuringsflow:**

Molenaar & Knoop-van Campen (2019) toonden aan dat leraren pas handelen op
dashboardinformatie als die direct koppelbaar is aan een concrete actie.
Dashboards die alleen data tonen worden nauwelijks gebruikt. De
goedkeuringsflow — AI suggereert, leraar keurt goed — is daarom de
architecturale kern van de samenwerking: het is het moment waarop mens en AI
elkaar ontmoeten en van elkaar leren.

---

### 6.3 Shared control: wie heeft de regie en wanneer?

**Microsoft HAX Guidelines (2019) — G1, G7, G8, G16.**

**Google PAIR Guidebook — Feedback + Controls.**

De verdeling van controle tussen mens en AI is het meest kritieke
ontwerpvraagstuk in mens-AI samenwerking. Te veel AI-autonomie ondermijnt de
leraar; te weinig maakt de AI nutteloos. Op basis van de Khanmigo-analyse zijn
vier concrete ontwerpkeuzes gemaakt:

**1. De AI neemt initiatief, de leraar neemt beslissingen (HAX G1)**

Khanmigo wacht altijd op de leraar. Juf Aimee signaleert proactief — maar
handelt pas nadat de leraar goedkeuring heeft gegeven. Niets bereikt een
leerling zonder expliciete goedkeuring van de leraar. Dit is het fundamentele
verschil tussen een tool en een collega.

**2. De leraar kan altijd corrigeren (HAX G7)**

De leraar kan elke AI-suggestie afwijzen, aanpassen of vervangen via de
chatinterface. Dit is de veiligheidsklep die de leraar de regie geeft zonder
de AI nutteloos te maken. Khanmigo doet dit goed via een thumbs-down knop en
vrije chat — Juf Aimee neemt dit over en voegt een expliciete 'Aanpassen'-knop
toe per opdrachtsuggestie.

**3. De AI legt altijd uit waarom (HAX G8 — het grootste gat)**

Khanmigo legt nooit uit waarom het een opdracht genereert. Dit is het
grootste gat in de mens-AI samenwerking bij Khanmigo: de leraar kan de AI niet
beoordelen als de AI zijn redenering niet toont. Juf Aimee toont bij elke
suggestie verplicht: het Bloom-niveau, de relevante data uit het
leerlingprofiel, en de reden voor de keuze. Zonder uitlegbaarheid is er geen
echte samenwerking — alleen blinde opvolging.

**4. De leraar behoudt globale controle over het AI-gedrag (HAX G16)**

Khanmigo heeft geen AI-gedragsinstellingen. Juf Aimee biedt de leraar de
mogelijkheid om het Bloom-streefniveau per leerling in te stellen, zodat de
AI-suggesties altijd binnen de pedagogische kaders van de leraar blijven.

---

### 6.4 Risico's: wanneer mens-AI samenwerking mis kan gaan

**College voor de Rechten van de Mens (2024). *Algoritmen in het onderwijs.*
KBA Nijmegen / ResearchNed.**

Mens-AI samenwerking brengt specifieke risico's met zich mee wanneer de leraar
te veel vertrouwen stelt in de AI zonder kritisch te blijven. Het College voor
de Rechten van de Mens waarschuwt dat algoritmen vooroordelen van mensen
kunnen versterken door ze te systematiseren — ook wanneer de leraar denkt dat
de AI objectief is.

Drie risico's die het ontwerp van Juf Aimee expliciet adresseert:

- **Automation bias:** de neiging om AI-suggesties klakkeloos te volgen.
  Tegenmaatregel: de goedkeuringsflow dwingt de leraar altijd actief te
  beslissen — er is geen automatische doorstroom naar de leerling.
- **Labeling:** een AI die een leerling permanent categoriseert als 'zwak' of
  'sterk'. Tegenmaatregel: Bloom-niveaus zijn dynamisch en tonen voortgang,
  geen vaste eigenschappen van een leerling.
- **Ondoorzichtigheid:** een leraar die niet begrijpt waarom de AI iets doet
  en daardoor niet kan bijsturen. Tegenmaatregel: uitlegbaarheid (HAX G8) is
  een harde ontwerpeis, niet een optionele feature.

---


### Bronnen

- Anderson, L.W. & Krathwohl, D.R. (2001). *A taxonomy for learning,
  teaching, and assessing.* Pearson.
- College voor de Rechten van de Mens (2024). *Algoritmen in het onderwijs.*
  KBA Nijmegen / ResearchNed.
- Knoop-van Campen, C. & Molenaar, I. (2020). How teachers integrate
  dashboards into their feedback practices. *Frontline Learning Research,*
  8(4), 37–51.
- Microsoft Research (2019). *Guidelines for Human-AI Interaction (HAX).*
- Molenaar, I. (2022). Towards hybrid human–AI learning technologies.
  *European Journal of Education,* 57(4), 632–645.
- Molenaar, I. & Knoop-van Campen, C.A.N. (2019). How teachers make dashboard
  information actionable. *IEEE Transactions on Learning Technologies,* 12(3),
  347–355.
- TAICo — Teacher-AI Complementarity Consortium. NOLAI / Radboud Universiteit
  (lopend).
- Van Kessel, M., Molenaar, I. et al. (2025). Primary school teacher
  perspectives on effective dashboard use. *Journal of Learning Analytics,*
  12(2), 279–292.