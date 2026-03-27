# Onderzoek: Verbeterpunten voor Juf Aimee Prototype
## Hybride AI door samenwerking - Sprint 2

---

## Inleiding

Dit document beschrijft de onderzoeksresultaten en aanbevelingen voor het verbeteren van het Juf Aimee prototype, een AI-ondersteunende assistent voor docenten die werken met hoogbegaafde leerlingen in het basisonderwijs. Het onderzoek is uitgevoerd in Sprint 2 en richt zich op de vraag:

**Hoe kunnen bestaande LLM-assistenten de samenwerking tussen AI en leraar vormgeven, zodat Juf Aimee de leraar kan ondersteunen zonder dat de leraar de regie verliest?**

De onderzoeksmethode bestaat uit:
1. Analyse van commerciële AI-onderwijs hulpmiddelen (zoals Khanmigo)
2. Evaluatie tegen erkende frameworks voor verantwoorde AI (Microsoft HAX Guidelines, Google PAIR Guidebook)
3. Synthese van verbeterpunten voor het huidige Juf Aimee prototype
4. Formulering van concrete aanbevelingen voor implementatie

---

## Onderzoeksframeworks

### Microsoft HAX Guidelines
Microsoft Human-AI eXperience (HAX) Guidelines bevatten 18 evidence-based richtlijnen voor het ontwerpen van gebruikersgerichte AI-systemen. Belangrijke criteria voor ons onderzoek:

- **G1**: Maakt de AI duidelijk wat het wel en niet kan doen?
- **G2**: Maakt de AI duidelijk hoe goed het presteert?
- **G7**: Kan de gebruiker de AI makkelijk corrigeren?
- **G8**: Legt de AI uit waarom het iets heeft gedaan?
- **G13**: Gaat de AI netjes om met dingen die het niet weet?
- **G16**: Kan de gebruiker globaal instellen wat de AI doet?
- **G17**: Wordt de gebruiker op de hoogte gesteld als de AI iets verandert?

### Google PAIR Guidebook
Google's People + AI Research (PAIR) Guidebook richt zich op het ontwerpen van mens-gedreven AI-producten, met als kernprincipe dat mensen en AI van elkaar moeten kunnen leren over tijd.

Belangrijke thema's:
- Feedback + Controls: Hoe leert de AI van de gebruiker?
- Feedback + Controls: Heeft de gebruiker controle over wat de AI onthoudt?
- Feedback + Controls: Geeft de AI expliciete uitleg over zijn keuzes?
- Mental Models + Expectations: Hoe leert de gebruiker de AI better begrijpen?

---

## Analyse van Bestaande Oplossingen

### Khanmigo (Khan Academy)

Khanmigo is een AI-driven onderwijsassistent dieQuestion Generator en andere tools biedt voor leraren. Belangrijke observaties uit de analyse:

**Sterke punten:**
- Herhaaldelijk benadrukt dat "You're the expert" en de leraar de baas blijft
- Thumbs up/down feedback systeem voor continue verbetering
- Laagdrempelige chat interface die natuurlijke taal ondersteunt
- Transparantie over beperkingen: "I sometimes make mistakes"
- Double-check reminders op Output

**Beperkingen:**
- Geen sessie-overstijgend geheugen: each sessie begint opnieuw
- Geen uitleg over waarom bepaalde vragen worden gegenereerd (geen Bloom-referentie)
- Geen mogelijkheid voor leraar om AI-gedrag globaal aan te passen
- Geen side-by-side vergelijking van suggesties
- Proactieve suggesties ontbreken: leraar moet altijd initiatief nemen

---

## Verschil tussen Tools en Echte Assistant

Een belangrijk inzicht uit de analyse: Khanmigo is een **tool** die door de leraar moet worden bediend, terwijl Juf Aimee als een **assistent** moet functioneren die zelfstandig kan signaleren en suggesties kan doen.

**Tool (Khanmigo):**
- Leraar opent tool
- Leraar vult input in
- AI gener output
- Leraar accepteert/aanpast
- Gesloten sessie, geen geheugen

**Assistent (Juf Aimee):**
- Juf Aimee monitort voortgang
- Juf Aimee signaleert patronen
- Juf Aimee stelt proactief voor
- Leraar keurt goed/aanpast/afweert
- Bouwt relatie op over tijd

Dit verschil vereist specifieke functionaliteiten die in het prototype moeten worden geïmplementeerd.

---

## Synthese: Aanbevelingen voor Juf Aimee

Op basis van de frameworks en de analyse van Khanmigo zijn de volgende verbeterpunten geïdentificeerd:

### 1. Sessie-overstijgend Profielgeheugen

**Probleem**: Khanmigo onthoudt niets tussen sessies. Dit is een cruciale beperking voor een assistent.

**Oplossing**:
- Implementeer een database die voor elke leerling opslaat:
  - Voortgang per Bloom-niveau
  - Historie van opdrachten met scores en feedback
  - Interessepatronen en leerstijlobservaties
  - Voortgangs-curves en plateaus
- Voor elke leraar:
  - Voorkeuren voor aanpassingen (bv. "bij dit leerling vaak moeilijkheidsgraad verhoogd")
  - Veel gebruikte prompts en query-patronen
  - History van geaccepteerde/afgewezen suggesties

**Implementatie-aandacht**: Sla data lokaal op (school-omgeving), verzorg anonimisering voor analyse, en zorg voor consent voor datagebruik.

### 2. Transparante Uitleg (Explainable AI)

**Probleem**: AI-systemen leggen vaak niet uit waarom ze een bepaalde output genereren, wat vertrouwen ondermijnt.

**Oplossing**:
Elke gegenereerde opdracht/of aanbeveling moet worden geaccompagneerd door een uitlegblok:

```
VOORGESTELDE OPDRACHT: [tekst]

WAAROM DEZE OPDRACHT?
- Taxonomie-niveau: Analyse (Bloom niveau 4)
- Green op basis van: 7+ eerdere.successvolle opdrachten op niveau 3-4
- Persoonlijkheidsprofiel: Perfectie-gericht, daarom nadruk op methodologie
- Voortgangs-signaal: Klaar voor hoger denkniveau
- Risico-indicator: Mogelijke weerstand bij te open evaluatie (kiezen uit 3-4)
```

Deze uitleg is gebaseerd op:
- Actuele data (hoeveel opdrachten van welk niveau?)
- Profielteksten (kenmerken, interesses)
- Historische patronen (welke opdrachten werkten?)

### 3. Proactieve Suggesties met Kennis van Zaak

**Probleem**: Leraar moet altijd zelf initiatief nemen bij huidige tools.

**Oplossing**:
Juf Aimee moet automatisch signalen kunnen geven op het dashboard:

**Alert-typen:**
- 📈 Voortgangs-stagnatie: "Leerling X staat al 3 weken opzelfde Bloom-niveau"
- ⚠️ Risico op achterstand: "Leerling Y scoorde 2x onder gemiddelde"
- 🎯 Kans voor uitdaging: "Leerling Z toont interesse in wetenschap —推薦 experiment-opdracht"
- 🔄 Aanbeveling voor herhaling: "Vakgebied puzzels nog niet voldoende geoefend"

**Systeem**: ELKE suggestie heeft expliciete acties:
- [ ] Accepteren (direct opdracht aanmaken)
- [ ] Aanpassen (open in editor)
- [ ] Uitstellen (met reden)
- [ ] Afwijzen (met feedback)

### 4. Feedback Loop die Leert

**Probleem**: Simpele thumbs up/down is onvoldoende context voor AI-verbetering.

**Oplossing**:
Implementeer een gestructureerd feedbackformulier na elke interactie:

**Wanneer leraar een opdracht aanpast:**
- Welk onderdeel aangepast? (keuze: moeilijkheidsgraad, vraag-type, persoonlijkheidstoets, Taxonomie-niveau, andere)
- Wat was het probleem? (te makkelijk/te moeilijk/te abstract/te concreet/niet persoonlijk genoeg)
- Sla deze feedback op in sessie-log

**Wanneer leraar afwijst:**
- Waarom niet? (keuze: niet passend bij profiel/te laag niveau/te hoog niveau/oninteressant/andere reden)
- Voeg eventueel alternatieve richting toe

**AI-learning**:
- Bij toekomstige suggesties: voorkom patronen die vaak worden afgewezen
- Versterk patronen die vaak worden geaccepteerd of gewijzigd (als leraar specifieke aanpassingen doet, is dat signaal)
- Pas9619 generatieparameters aan op basis van leraar-gedrag

### 5. Meerdere Varianten per Suggestie

**Probleem**: Leraar moet oude outputs terugscrollen om te vergelijken.

**Oplossing**:
Genereer bij elke opdracht **3 varianten** met verschillende benaderingen:
- Variant A: Basis-aanpak ( veilige keuze)
- Variant B: Uitdagender ( hoger Bloom-niveau)
- Variant C: Creatieve invalshoek ( andere vraag-type)

Presenteer side-by-side met duidelijk gelabelde verschillen:
```
[Variant A]  [Variant B]  [Variant C]
Bloom: Apply  Bloom: Create  Bloom: Evaluate
Risico: Laag  Risico: Medium  Risico: Hoog
```

Laat leraar direct kiezen welk pad echt wordt voortgezet.

### 6. Contextafhankelijke Transparantie

**Probleem**: Te veel of te weinig uitleg kan problematisch zijn.

**Oplossing**:
Implementeer een **data-quality indicator**:
- 🟢 Green: Sterke data (7+ historische opdrachten, hoge betrouwbaarheid)
- 🟡 Yellow: Redelijke data (3-6 opdrachten, enige onzekerheid)
- 🔴 Red: Gebaseerd op inferentie (minder dan 3 opdrachten, profiel-only)

Klikbare indicator toont gedetailleerde uitleg:
"Deze suggestie is gebaseerd op INFERENTIE omdat we enkel 2 eerdere opdrachten van deze leerling hebben. De voorgestelde moeilijkheidsgraad is afgeleid van het TIQ-score en leerlingkenmerken. Overweeg zelf of dit past."

### 7. Lerarenonderwijs over het Systeem

**Probleem**: Leraren moeten begrijpen hoe Juf Aimee werkt en waar ze op moet letten.

**Oplossing**:
- **In-product tutorial**: bij eerste gebruik een korte, interactieve tour
- **Concept-uitleg**: korte module over Bloom's Taxonomie en waarom het belangrijk is
- **Contextuele help**: bij elke knop/feature een ?-icoon met "Waarom is dit nuttig?"-uitleg
- **Feedback educateer**: na feedback geven, laten zien hoe dat gebruikt wordt ("Jouw feedback wordt verwerkt in de volgende suggesties")
- **System insight scherm**: toon leraar hoe hun profiel eruitziet volgens Juf Aimee (transparantie)

---

## Taakverdeling: AI vs. Leraar

### Taken voor Juf Aimee (AI)
- ✅ Verzamelen en analyseren van leerlingdata (voortgang, scores, patronen)
- ✅ Signaleren van leerachterstanden, plateaus, kansen
- ✅ Genereren van opdrachtvoorstellen op basis van profiel
- ✅ Vergelijken van varianten (verschillende Bloom-niveaus, vraag-types)
- ✅ Uitleggen van aanbevelingen met referentie aan data en theorie
- ✅ Bouwen en onderhouden van leerling- en leraarprofielen
- ✅ Aanpassen van toekomstige suggesties op basis van leraar-feedback

### Taken voor de Leraar (menselijke controle)
- ✅ Interpreteren van AI-signalen in concrete context (bv. "heeft deze leerling vandaag een mindere dag?")
- ✅ Pedagogische keuzes maken (wanneer uitdagen, wanneer ondersteunen)
- ✅ Persoonlijke begeleiding en motivatie van leerlingen
- ✅ Eindbeslissing nemen over welke opdracht uitgevoerd wordt
- ✅ Evalueert effect van opdrachten na uitvoering
- ✅ Corrigeert en verfijnt AI-aanbevelingen met eigen expertise

**Kriterium**: De leraar neemt altijd de eindbeslissing. Juf Aimee ondersteunt met inzichten en opties, maar plaatst nooit een opdracht voor een leerling zonder expliciete leraar-goedkeuring.

---

## Dashboard en Leerlingenportaal: Verdeelde Verantwoordelijkheden

### Visie: Twee Portalen, Één Geïntegreerd Systeem

**Dashboard (Leerkracht-bewakingsportal)** - Centrale controle:
- Actuele alerts en AI-signalen
- Overzicht van alle leerlingen en hun status (voortgang, Bloom-niveaus, scores)
- Suggesties-module met checkboxes voor acceptatie/afwijzing
- Toegang tot leerling-gedetailleerde inzichten
- Instellingen voor AI-gedrag per leerling/klas

**Leerlingenportaal (Uitvoeringsportal)** - Eenvoudig en veilig:
- Alleen opdrachten die door leraar zijn goedgekeurd
- Voortgangsindicatoren (eigen leerpad)
- Geen directe AI-toegang voor leerlingen
- Geen kruisbestuiving met leraren-dashboard

**Scheiding**: AI analyseert vanuit dashboard, plaatst nooit direct in leerlingenportaal. Alle content moet eerst door leraar.

---

### Controlemechanismen: Wie Heeft Welke Beslissing?

| Beslissingsoort | Wie neemt beslissing? | AI-rol | Controlemechanisme |
|-----------------|---------------------|--------|-------------------|
| Welke opdracht gegenereerd wordt | AI stelt voor | Generator van opties | Leraar kiest uit 3 varianten of past aan |
| Welke opdracht wordt uitgevoerd | **Leraar** | Nemen geen deel | Leraar plaatst opdracht in leerportaal |
| Moeilijkheidsgraad | AI adviseert op basis van data | Niveau-aanbeveling | Leraar kan wijzigen voor elke opdracht |
| Taxonomie-niveau | AI analyseert huidige niveau | Rapportage + suggestie | Leraar manual override knop |
| Persoonlijke aanpassing (bv. Julia's faalangst) | AI interpreteert profiel | Pattern-matcher | Leraar kan profiel-elementen uitschakelen |
| Wanneer een opdracht wordt voorgesteld | AI signaleert patronen | Proactieve alerts | Leraar bepaalt frequentie en prioriteit |
| Welke data wordt verzameld | Beide (leraar-initiatief) | Ordent en structureert | Leraar kiest data-bronnen |
| Welke opdrachten zijn "succesvol" | Leraar evalueert | Meetbare indicatoren + subjectieve beoordeling | Leraar markeert als "goed/lesson/goed" |
| AI-gedrag aanpassen | Leraar configureert | Leert uit feedback | Leraar stelt thresholds, frequentie, stijl |

**Herrule**: Geen autoriteit voor AI om iets te plaatsen, wijzigen of verwijderen. AI is een **adviseur**, niet een executor.

---

### Vakresultaten vs. AI-Aanbevelingen: Balans Data en Menselijke Expertise

**Vraag**: Hoe moeten vakresultaten van leerlingen worden gebruikt om materiaal te verbeteren?

**Antwoord**: Dubbele feedback-loop:

**Data-gedreven laag (AI):**
- Analyseert objectively meetbare uitkomsten:
  - Opdracht-scores (cijfers 1-10)
  - Voltooiingstijd
  - Herhalingsfrequentie
  - Bloom-niveau progressie
- AI accepteert "succes" als: hoge scores + voortgang + snelle doorloop
- "Mislukt" geïdentificeerd als: lage scores, veel herhalingen, terugval

**Leraar-expertise laag (mens):**
- Evalueert qualities:
  - Was de leercoin essentieel (ook bij lage score)?
  - Was de leerling gemotiveerd?
  - Heeft onverwachte learning outcomes?
  - Past de optie bij persoonlijkheid?
- Leraar kan AI-aanbevelingen "corrigeren":
  - Markeren: "Deze opdracht was waardevol ondanks lage score"
  - Markeren: "Deze opdracht niet relevant, negeer data"
  - Handmatig "belangrijk" label plakken

**Implementatie**: Na elke opdracht:

1. Automatische data-acquisitie: score, tijd, niveau-verandering
2. AI-analyse: "Succesvol" of "Niet succesvol"
3. Leraar-evaluatie: beide signals, keuze:
   - ✅ AI-analyse accepteren
   - ⚠️ AI-analyse aanpassen (met redenering)
   - ❌ AI-analyse verwerpen (met feedback)
4. Database update: Combineer AI-data + leraar-feedback

**Belangrijk**: AI leert van leraar wat "succes" betekent voor deze specifieke leerling.

---

## Herziening van Taakverdeling: Complementariteit in Praktijk

**Uit gesprek met docent**: "dat ze elkaar aanvullen" betekent geen overlapping, maar **echte complementariteit**.

**Wat AI goed kan (en leraar niet nodig heeft):**
- 🔍 Patronenherkenning over honderden data-punten
- 📊 Historische tracking
- ⚡ Real-time analyse
- 💡 Optie-generatie (3 varianten per opdracht)
- 🔄 Personalisatie scaling

**Wat leraar goed kan (en AI niet kan):**
- 🧠 Context-inzicht (bv. thuissituatie)
- ❤️ Empathie en motiveren
- 🎯 Doelgerichtheid
- ⚖️ Afwegingen maken
- 🔄 Reflectie op wat écht geleerd is
- 🤝 Relatiebouw

**Cruciaal**: **Beslissing** over welke AI-voorstellen gekozen wordt, altijd bij leraar. AI geeft opties, leraar kiest. AI legt uit *waarom* een optie wordt voorgesteld, leraar beslist *of* het past.

---

## Hybride Model: Wanneer is het Werkelijk Hybride?

### Scenario 1: AI stelt voor, Leraar besluit ✅ **Hybride**
- AI: "Julia klaar voor niveau 5, op basis van 7 opdrachten op niveau 4"
- Leraar: "Ja, dat past" of "Nee, blijf bij niveau 4"
- Controle: Leraar (eindbeslissing), AI (analyse)

### Scenario 2: AI plaatst automatisch ❌ **Niet hybride**
- AI: "Julia klaar voor niveau 5 → automatisch opdracht in portfolio"
- Leraar moet het terugdraaien
- Controle: AI (beslist), leraar (sorry-mode)

### Scenario 3: AI toont opties, leraar past aan ✅ **Hybride**
- AI: 3 varianten niveau 5
- Leraar: neemt variant B, verlaagt moeilijkheid, voegt aanmoediging toe
- Leraar: plaatst in leerlingenportaal
- Controle: Gedeelde, maar leraar has final say

### Scenario 4: Leraar vraagt AI om suggestie ✅ **Hybride**
- Leraar: "Opdracht voor Milan, interesses: techniek, niveau: 4"
- AI: geeft 3 opties met uitleg
- Leraar: kiest, past aan, plaatst
- Controle: Leraar-initieerd, AI-responsief

**Definitie van hybride**: AI en leraar werken samen waarbij **alle uitvoeringsbeslissingen bij de leraar liggen**, maar AI **continu informatie en opties levert**. AI-leden nooit initiatief volledig over, en leraar kan op elk moment zeggen dat AI "te ver" gaat.

---

## Praktijkrichtlijnen voor Implementatie

### Dashboard-ontwerp-principes:
1. **Alert-burndown**: elke suggestie heeft "Dismiss" / "Snooze" / "Act" opties
2. **Context always visible**: elke AI-output toont: "Gebaseerd op: [data bronnen]" + "Betrouwbaarheid: 🟢🟡🔴"
3. **Manual override prominent**: "Change this opdracht manually" knop altijd in zicht
4. **Lerarentaak always at the top**: dashboard mag leraar niet afleiden van hun eigen planning

### Veiligheid:
- **No auto-publish**: géén AI-output mag direct zichtbaar zijn voor leerlingen
- **Audit trail**: elke AI-aanbeveling gelogd met timestamp, data-bron, betrouwbaarheidsscore
- **Rollback ability**: leraar kan opdracht verwijderen en "herstel naar AI-advies" kiezen

---

## Implementatieplan voor Prototype

### Fase 1: Kernarchitectuur (urgent)
- Database schema voor leerling- en leraarprofielen
- Sessie-overstijgende opslag van alle historie
- Basis-versie van "proactive suggestions" dashboard module
- Eenvoudige uitleg bij suggesties (waarom deze opdracht?)

### Fase 2: Gebruikerservaring
- Implementatie van 3-varianten generator (side-by-side layout)
- Gedetailleerd feedbackformulier met categorisaties
- Data-quality indicators (🟢🟡🔴)
- Contextuele help en tutorial voor nieuwe leraren

### Fase 3: Geavanceerde Functionaliteiten
- AI-learning uit leraar-feedback (adaptive prompting)
- Vergelijkingsscherm met historische suggests
- Change-notificaties wanneer AI-logica wordt bijgesteld
- "AI-insights" scherm: laat zien wat Juf Aimee over leraar heeft geleerd

---

## Risico's en aandachtspunten

### Privacy
- Leerlingdata moet lokaal op school worden opgeslagen
- Geen cloud-sharing zonder expliciete toestemming
- Anonimisering voor systeem-brede analyses
- Duidelijke consent流程 voor ouders/voogd

### Bias en Fairness
- Zorg dat TIQ-scores niet leiden tot beperkte verwachtingen
- Controleer of aanbevelingen diversiteit in denk-niveaus bevorderen
- Vermijd stereotypering op basis van profiel-kenmerken
- Periodic bias-audits van AI-outputs

### Over-automatisering
- AI moet nooit zelfstandig opdrachten plaatsen bij leerlingen
- Alle suggesties moeten expliciet worden vrijgegeven door leraar
- Easy "undocumemt" of "verwachting aanpassen" opties
- Balance tussen proactief en opdringend

### Transparantie-overload
- Niet elke technische detail tonen (houd het begrijpelijk)
- Progressive disclosure: basis-uitleg standaard, details op aanvraag
- Vermijd jargon, gebruik concrete voorbeelden
- Test met leraren of uitleg nuttig en niet overdonderend is

---

## Conclusie en Aanbevelingen

### Kerninzichten
1. **Geheugen onderscheidt Assistant van Tool**: Juf Aimee moet profielen opbouwen over tijd, anders is het alleen een tool en geen assistent.
2. **Uitlegbaarheid bouwt vertrouwen**: Elke AI-output moet vergezeld gaan van een "waarom" dat verwijst naar data en theorie (Bloom).
3. **Feedback moet.Context-rijk zijn**: Thumbs up/down is onvoldoende; leraar moet kunnen specificeren wat goed/fout was.
4. **Proactief, maar niet opdringerig**: Juf Aimee moet signaleren, maar leraar beslist altijd.

### Strategische Aanbevelingen
1. **Fokus op "Assistant-mentality"**: ontwerp voor samenwerking, niet vervanging
2. **Maak onzekerheid zichtbaar**: als AI weinig data heeft, moet dat duidelijk zijn (🟡🔴 indicators)
3. **Pedagogische alignering**: alle suggesties gebaseerd op erkende didactiek (Bloom), niet alleen data-pabelle
4. **Iteratief verbeteren**: gebruik leraar-feedback om AI voortdurend aan te passen

### Volgende Stappen
- Implementeer Fase 1-2 van het implementatieplan
- Test met 2-3 docenten in praktijk
- Verzamel kwalitatieve feedback over uitleg- en feedback-mechanismen
- Pas aan op basis van observaties
- Documenteer resultaten voor definitieve prototype versie

---

## Bronnen

- Microsoft Research. (2020). Guidelines for Human-AI Interaction.
- Google PAIR Guidebook. (2019). People + AI Research.
- Khanmigo productdocumentatie en eigen testresultaten.
- Bloom's Taxonomie: Blooms Taxonomy for Learning, Teaching, and Assessing.
- Emerald - Hybride Intelligence artikel.
- Dialogues Review - AI in Education.
