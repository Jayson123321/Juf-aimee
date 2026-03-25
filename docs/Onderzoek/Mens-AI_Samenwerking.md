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
| (G7) Kan de leraar de AI makkelijk corrigeren? | Ja — Bij de tool: Question Generator: "If you see Khanmigo make a mistake, tap the Thumbs Down icon| |
| (G8) Legt de AI uit waarom het iets heeft gedaan? |Nee —  Bij het genereren van vragen vult de leraar zelf het grade level, hoeveelheid vragen en de tekst in als input. De AI baseert zich dus op wat de leraar aanlevert, maar legt niet uit waarom het deze specifieke vragen heeft gekozen. Er is geen referentie aan bijvoorbeeld de Taxonomie van Bloom.
   | |
| (G13) Gaat de AI netjes om met dingen die het niet weet? |Khanmigo Question Generator genereert toch vragen en antwoorden, ook bij onzintekst. Het geeft wel eerlijk aan in de antwoordsleutel dat de tekst geen betekenis heeft ("the text appears to be random letters"), maar weigert de taak niet. Het gaat dus door ook als de input zinloos is.
 | |
| (G16) Kan de leraar globaal instellen wat de AI doet? | | |
| (G17) Wordt de leraar op de hoogte gesteld als de AI iets verandert? | | |
| **Google PAIR Guidebook — leren van elkaar** | | |
| Feedback + Controls — Hoe leert de AI van de leraar? |Ja — Bij de Question Generator zowel vooraf via de disclaimer "It'll learn to get better via the thumbs down button!" als achteraf via de "Leave feedback" knop.
 | |
| Feedback + Controls — Heeft de leraar controle over wat de AI onthoudt? | | |
| Feedback + Controls — Geeft de AI expliciete uitleg over zijn keuzes? | Nee — Bij de Question Generators zegt de AI alleen "OK! I've drafted some questions and answers for you. Let me know if you have any questions!" zonder verdere toelichting.
| |
| Feedback + Controls — Kan de leraar meerdere AI-suggesties vergelijken en kiezen? | | |
| Mental Models + Expectations — Hoe leert de leraar de AI beter begrijpen over tijd? | | |

---

## Resultaten


## Conclusie & Advies
Khanmigo laat zien dat het expliciet positioneren van de leraar als expert een bewuste en effectieve ontwerpkeuze is. De zin "You're the expert" verschijnt niet toevallig — het is een terugkerend principe door de hele tool heen. Dit is precies wat Michel bedoelde: Juf Aimee mag geen tool zijn die de leraar vervangt, maar moet de leraar versterken.
Advies voor Juf Aimee:
Neem dit principe over — laat Juf Aimee op meerdere momenten expliciet benoemen dat de leraar de uiteindelijke beslissing neemt. Bijvoorbeeld bij het genereren van een opdracht: "Controleer of deze opdracht past bij jouw leerling".
Waar Khanmigo tekortschiet is transparantie over waarom de AI iets genereert. Er is geen referentie aan de Taxonomie van Bloom of het niveau van de leerling. Juist hier kan Juf Aimee het verschil maken — door wél uit te leggen waarom een opdracht is gekozen, bijvoorbeeld: "Deze opdracht spreekt hogere orde denkvaardigheden aan op het niveau van Analyseren (Bloom)".
