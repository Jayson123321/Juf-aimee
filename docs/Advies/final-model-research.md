# Inleiding

Binnen het onderwijs is er een groeiende behoefte aan gepersonaliseerde ondersteuning, met name voor hoogbegaafde leerlingen in de leeftijd van 6 tot 12 jaar die extra uitdaging nodig hebben binnen het reguliere klaslokaal. Het project *Juf Aimee* (AI-mee) richt zich op het ontwikkelen van een hybride AI-assistent die leerkrachten helpt bij het aanbieden van passend en verdiepend lesmateriaal.

De assistent moet op basis van verschillende databronnen — zoals TIQ, leerdoelen en de taxonomie van Bloom — automatisch vragen genereren, antwoorden beoordelen en leerlingen begeleiden zonder direct het juiste antwoord te geven. Daarnaast moet het systeem multimodaal functioneren: het moet afbeeldingen kunnen analyseren, educatieve afbeeldingen kunnen genereren en interactieve opdrachten kunnen maken met behulp van HTML, CSS en JavaScript.

Hiervoor wordt gebruikgemaakt van een Retrieval-Augmented Generation (RAG)-architectuur, waarbij externe kennis wordt gecombineerd met een taalmodel. De keuze van het juiste AI-model is hierbij cruciaal, omdat niet elk model geschikt is voor zowel tekstuele, visuele als interactieve taken.

In dit onderzoek wordt gekeken naar de geschiktheid van verschillende modeltypes voor *Juf Aimee*, beginnend met instruct-modellen.

---

## Instruct-modellen

Instruct-modellen zijn taalmodellen die specifiek zijn getraind om instructies van gebruikers te volgen, vaak met behulp van technieken zoals Reinforcement Learning from Human Feedback (RLHF). Hierdoor zijn ze goed in het uitvoeren van concrete opdrachten en het genereren van gecontroleerde output.

Binnen het project *Juf Aimee* zijn instruct-modellen relevant omdat ze goed kunnen omgaan met gestructureerde taken zoals het genereren van vragen op verschillende niveaus van Bloom, het beoordelen van antwoorden en het geven van hints. Echter, voor deze toepassing is het ook belangrijk om te kijken naar hun prestaties op het gebied van multimodaliteit en interactieve content.

### Pro's

* **Sterk in gestructureerde opdrachten**
  Geschikt voor het genereren van vragen op basis van Bloom-niveaus en leerlingprofielen.

* **Effectief binnen RAG**
  Gebruiken opgehaalde context goed en blijven doorgaans binnen de gegeven informatie (Lewis et al., 2020, sectie 2).

* **Controleerbare output**
  Belangrijk voor educatieve toepassingen waarbij het model geen directe antwoorden mag geven.

* **Codegeneratie mogelijk**
  Veel instruct-modellen kunnen HTML, CSS en JavaScript genereren voor interactieve oefeningen.

### Cons

* **Beperkte multimodale capaciteiten (lokaal)**
  Veel lokaal draaiende instruct-modellen (zoals kleinere Qwen-varianten) ondersteunen geen of beperkte beeldherkenning en -generatie.

* **Afbeeldingsgeneratie vereist aparte modellen**
  Instruct-modellen kunnen meestal niet zelf afbeeldingen genereren; hiervoor zijn aparte diffusion-modellen nodig.

* **Kwaliteit van interactie met kinderen**
  Niet alle instruct-modellen zijn goed afgestemd op taalgebruik en didactiek voor de leeftijdsgroep 6–12 jaar.

* **Beperkingen in complex redeneren**
  Vooral kleinere modellen kunnen moeite hebben met hogere orde denkvaardigheden (Bloom: analyseren, evalueren).

### Alternatieven

* **Multimodale chat-modellen (bijv. Claude)**
  Ondersteunen tekst én afbeeldingen (input), en zijn vaak beter in natuurlijke interactie en uitleg op kindniveau.

* **Combinatie van modellen (hybride aanpak)**

  * Instruct-model voor tekst en logica
  * Vision-model voor afbeeldingherkenning
  * Diffusion-model voor afbeeldinggeneratie
    Dit sluit goed aan bij schaalbare architecturen.

* **Gespecialiseerde code-modellen**
  Voor het genereren van interactieve HTML/JS opdrachten met hogere kwaliteit en betrouwbaarheid.

### Aanbeveling

Voor *Juf Aimee* zijn instruct-modellen geschikt als basis voor tekstuele taken binnen een RAG-systeem, zoals vraaggeneratie en beoordeling. Echter, gezien de doelgroep (6–12 jaar) en de vereiste functionaliteiten (beeldherkenning, afbeeldinggeneratie en interactieve opdrachten), is een enkel instruct-model niet voldoende.

Een hybride architectuur wordt aanbevolen, waarbij:

* een instruct-model wordt gebruikt voor gestructureerde taken en RAG,
* een multimodaal model wordt ingezet voor beeldanalyse en interactie,
* en aanvullende modellen worden gebruikt voor afbeeldinggeneratie en interactieve content.

Voor testdoeleinden kan een lokaal instruct-model (zoals Qwen) volstaan, maar voor productie is het aan te raden om krachtigere (eventueel cloudgebaseerde) multimodale modellen te evalueren.

---

## Acceptatiecriteria

Om te bepalen welk AI-model geschikt is voor *Juf Aimee*, worden de volgende acceptatiecriteria gehanteerd:

* **Vraaggeneratie (incl. interactief)**
  Het model moet kwalitatief goede vragen kunnen genereren op verschillende niveaus van de taxonomie van Bloom. Daarnaast moet het in staat zijn om interactieve opdrachten te genereren met HTML, CSS en JavaScript, of correct samen te werken met voorgeschreven code die deze functionaliteit verzorgt.

* **Integratie met RAG**
  Het model moet effectief kunnen werken binnen een Retrieval-Augmented Generation (RAG)-architectuur. Dit betekent dat het relevante context uit opgehaalde bronnen correct gebruikt en geen ongefundeerde informatie toevoegt (Lewis et al., 2020, sectie 2).

* **Instructiegevoeligheid**
  Het model moet nauwkeurig instructies volgen, inclusief complexe constraints zoals: “geef geen direct antwoord” of “formuleer een hint”. Dit is essentieel voor didactisch verantwoorde begeleiding.

* **Uitlegbaarheid en brongebruik**
  Het model moet kunnen uitleggen waar informatie vandaan komt en transparant omgaan met gebruikte context. Dit is belangrijk voor controleerbaarheid en vertrouwen in het systeem.

* **Taalvaardigheid (NL & EN)**
  Het model moet zowel Nederlands als Engels goed beheersen en zich kunnen aanpassen aan de taalontwikkeling van kinderen van 6–12 jaar. Dit betekent eenvoudige, duidelijke en pedagogisch verantwoorde formuleringen.

* **Multimodaliteit**
  Het model moet afbeeldingen kunnen analyseren (bijvoorbeeld voor visuele opdrachten) en idealiter ook ondersteunen in het genereren van educatieve afbeeldingen (eventueel via integratie met andere modellen).

---

## Overweging

Op basis van de bovenstaande criteria kan een eerste strategische keuze worden gemaakt voor de ontwikkel- en productiefase van *Juf Aimee*.

Voor de **testfase** is het aan te raden om gebruik te maken van cloudgebaseerde modellen. Deze modellen bieden hogere kwaliteit, betere multimodale mogelijkheden en snellere iteratie tijdens ontwikkeling. Omdat er in deze fase wordt gewerkt met dummy data, zijn privacyrisico’s beperkt.

Voor de **productiefase (livegang)** is privacy een belangrijke factor, aangezien er gewerkt wordt met echte leerlinggegevens. In dat geval is het onwenselijk dat deze data wordt gedeeld met externe modelproviders. Daarom is het advies om een eigen serveromgeving op te zetten waarop een krachtig lokaal model kan draaien.

Dit betekent concreet:

* Investeren in een server (of krachtige hardware zoals een Mac Mini of dedicated GPU-server)
* Gebruikmaken van een zwaar, lokaal draaiend model dat voldoet aan de acceptatiecriteria
* Eventueel een hybride aanpak waarbij gevoelige data lokaal blijft en minder kritische taken via externe modellen verlopen

Deze aanpak combineert de voordelen van krachtige AI-modellen met controle over data en privacy, wat essentieel is binnen een onderwijscontext.

---

---

## Chat-modellen

Chat-modellen zijn taalmodellen die specifiek geoptimaliseerd zijn voor conversatie en interactie met gebruikers. In tegenstelling tot standaard instruct-modellen zijn ze beter afgestemd op natuurlijke dialogen, contextbehoud en het geven van uitleg op een begrijpelijk niveau.

Binnen *Juf Aimee* zijn chat-modellen bijzonder relevant voor de rol van AI-assistent die leerlingen begeleidt tijdens het maken van opdrachten.

### Pro's

* **Sterk in uitleg en begeleiding**
  Ze kunnen complexe onderwerpen uitleggen op een manier die aansluit bij het niveau van kinderen (6–12 jaar).

* **Goed in ‘geen antwoord geven’**
  Chat-modellen zijn beter in het geven van hints, doorvragen en het stimuleren van denken zonder direct oplossingen te geven.

* **Contextbewust**
  Ze kunnen een gesprek volgen en eerdere antwoorden meenemen in hun begeleiding.

* **Geschikt voor assistent-rol**
  Ideaal voor de sidebar AI die leerlingen helpt tijdens opdrachten.

### Cons

* **Minder voorspelbaar**
  Soms minder strikt in het volgen van instructies dan instruct-modellen.

* **Vaak cloud-gebaseerd**
  Veel sterke chat-modellen (zoals Claude) draaien extern, wat privacyvraagstukken oplevert.

* **Kosten en schaalbaarheid**
  Door gebruik via API kunnen kosten oplopen bij intensief gebruik.

### Alternatieven

* Instruct-modellen voor meer controle
* Fine-tuned modellen specifiek op educatie

### Aanbeveling

Chat-modellen zijn zeer geschikt voor de interactieve assistent binnen *Juf Aimee*. Ze moeten vooral worden ingezet voor begeleiding, uitleg en het ondersteunen van leerlingen tijdens het leerproces.

---

## Multimodale modellen

Multimodale modellen zijn AI-modellen die meerdere soorten input kunnen verwerken, zoals tekst en afbeeldingen. Voor *Juf Aimee* is dit essentieel, omdat leerlingen ook werken met visuele informatie.

### Pro's

* **Afbeeldingsherkenning**
  Kunnen afbeeldingen analyseren en gebruiken in vraagstellingen.

* **Rijkere leerervaring**
  Ondersteunen visueel leren, wat belangrijk is voor kinderen.

* **Combinatie van tekst en beeld**
  Kunnen context uit verschillende bronnen combineren.

### Cons

* **Zwaardere modellen**
  Vereisen meer rekenkracht en zijn moeilijker lokaal te draaien.

* **Afbeeldingsgeneratie vaak apart**
  Niet elk multimodaal model kan ook afbeeldingen genereren.

* **Complexere implementatie**
  Integratie met RAG en andere systemen is ingewikkelder.

### Alternatieven

* Losse vision-modellen + instruct-model
* Externe image generation tools

### Aanbeveling

Multimodale modellen zijn noodzakelijk voor volledige functionaliteit van *Juf Aimee*, maar hoeven niet per se één model te zijn. Een combinatie van gespecialiseerde modellen kan efficiënter zijn.

---

## Architectuur & Eindadvies

Op basis van de acceptatiecriteria en de analyse van modeltypes is het advies om een **hybride, gelaagde architectuur** te gebruiken. In plaats van één model alles te laten doen, wordt het systeem opgebouwd uit meerdere gespecialiseerde componenten die samenwerken.

### Kernprincipe

Alle output in het systeem moet gebaseerd zijn op dezelfde **RAG-context (ground truth)**. Eén centraal model (instruct-model) fungeert als **planner/regisseur**, terwijl andere modellen specifieke taken uitvoeren.

### Pipeline (stap-voor-stap)

1. **Input (leerkracht / systeem)**

   * Bloom-niveau
   * Extra instructies
   * (Optioneel) type opdracht: tekst / interactief / visueel

2. **RAG (context ophalen)**

   * Haalt relevante leerstof en context op uit databronnen
   * Output = gecontroleerde, feitelijke basis voor de opdracht

3. **Instruct-model (planner)**

   * Verwerkt input + RAG-context
   * Genereert een **gestructureerd plan** i.p.v. direct eindresultaat, bijvoorbeeld:

```json
{
  "type": "interactive",
  "learning_goal": "...",
  "question": "...",
  "answer_logic": "...",
  "hints": ["..."],
  "explanation": "...",
  "visual_needed": true
}
```

* Dit plan bewaakt didactiek (Bloom), niveau (6–12 jaar) en brongebruik

4. **Specialized generators (uitvoering)**

   * **Interactieve opdrachten (HTML/CSS/JS)**
     Input: plan + context
     Model: instruct/code-model
     Output: werkende interactieve opdracht

   * **Afbeeldingen (optioneel)**
     Input: beschrijving uit plan
     Model: image generation model
     Output: educatieve afbeelding

   * **Vision (indien input afbeelding)**
     Input: afbeelding van leerling
     Model: vision-model
     Output: beschrijving → terug naar instruct-model (niet direct naar eindoutput)

5. **AI-assistent (sidebar)**

   * Model: chat-model
   * Input:

     * originele opdracht
     * plan
     * RAG-context
   * Functies:

     * hints geven (zonder antwoord)
     * vragen terugstellen
     * uitleg geven op kindniveau

### Belangrijk ontwerpprincipe

* Instruct-model = **beslisser / planner**
* Andere modellen = **uitvoerders**
* RAG = **enige bron van waarheid**

Dit voorkomt dat verschillende modellen tegenstrijdige of ongefundeerde informatie genereren.

### Opdeling in het systeem

* **Vraaggeneratie (backend)**
  Instruct-model + RAG → maakt plan

* **Type opdracht keuze**
  Op basis van plan:

  * Tekstuele vraag
  * Interactieve opdracht (HTML/CSS/JS)
  * Visuele opdracht (met afbeelding)

* **AI-assistent (frontend/sidebar)**
  Chat-model → begeleiding leerling

* **Multimodale componenten**
  Vision + image generation als ondersteunende tools

### Omgeving

* **Testfase**
  Cloudgebaseerde modellen (hogere kwaliteit, snelle iteratie, gebruik van dummy data)

* **Productiefase (livegang)**
  Lokale serveromgeving:

  * Privacy (geen leerlingdata naar externe aanbieders)
  * Controle over modelgedrag
  * Mogelijkheid tot draaien van zwaardere modellen

### Samenvattend advies

De optimale oplossing voor *Juf Aimee* is een hybride systeem waarin:

* een instruct-model met RAG de centrale logica verzorgt,
* chat-modellen worden ingezet voor begeleiding,
* en multimodale modellen worden gebruikt voor visuele en interactieve onderdelen.

Deze architectuur combineert kwaliteit, controle en privacy, en sluit aan bij de didactische eisen van het onderwijs.

---

## Bronnen

Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., … & Kiela, D. (2020). *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*. In Advances in Neural Information Processing Systems (NeurIPS 2020), sectie 2: Model Architectuur.

Ouyang, L., Wu, J., Jiang, X., Almeida, D., Wainwright, C., Mishkin, P., … & Lowe, R. (2022). *Training language models to follow instructions with human feedback*. In Advances in Neural Information Processing Systems (NeurIPS 2022), sectie 3: Methods.

OpenAI. (2023). *GPT-4 Technical Report*. Sectie 2: Multimodal Capabilities.
