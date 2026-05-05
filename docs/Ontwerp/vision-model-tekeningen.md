# Ontwerp: AI-analyse van tekeningen voor lerarenfeedback

## Probleemstelling

Leerlingen kunnen tekeningen insturen als resultaat van een opdracht. Het handmatig schrijven van feedback op tekeningen kost een docent veel tijd, zeker wanneer meerdere leerlingen tegelijk een tekenopgave hebben afgerond. Er is behoefte aan een functie die de docent een startpunt geeft voor het schrijven van feedback, zonder de controle weg te nemen.

Dit sluit aan op issue:

[#65](https://gitlab.fdmci.hva.nl/studio/responsible-applied-artificial-intelligence/student-projects/2025-2026/semester-2/group-projects/studio-rai-group-project-q129/-/issues/65): *Als leerling wil ik tekeningen kunnen insturen naar de leraar, zodat de tekening kan worden geanalyseerd door een vision model en suggesties worden gepresenteerd aan de leraar voor het schrijven van de feedback.*

---

## Ontwerpkeuze

Er is gekozen voor een AI-gestuurde analyseknop in het feedbackformulier van de docent. Wanneer een leerling een afbeelding heeft ingestuurd, verschijnt de knop **"Analyseer tekening"** automatisch. De docent kan zelf kiezen of hij deze gebruikt.

Het vision model (LLaVA:7b via Ollama) analyseert de tekening en genereert een gestructureerde suggestie met de volgende onderdelen:

- *Wat is er te zien?* — 
  concrete beschrijving van de tekening
- *Opdracht begrepen?* — heeft de leerling de opdracht uitgevoerd?
- *Sterke punten* — wat goed is aan de tekening
- *Verbeterpunten* — wat beter kan

De gegenereerde tekst wordt ingeladen in de feedbacktekstbox. De docent kan deze volledig bewerken of verwijderen voor het opslaan.

---

## Modelkeuze: LLaVA:7b

| Overweging | Keuze |
|-----------|-------|
| Privacy | Lokaal via Ollama — geen data naar externe API's |
| Kosten | Gratis, geen API-kosten per aanroep |
| Grootte | 7b parameters — draaibaar op een standaard laptop met GPU |
| Kwaliteit | Voldoende voor het beschrijven en beoordelen van eenvoudige tekeningen |

Dit is een model dat ook werkt op de lokale machines en geeft de indruk hoe de AI-feature werkt binnen het platform. Zwaardere modellen kunnen via de cloud gebruikt worden.

---

## Ontwerpprincipes

- **Docent blijft in controle** — de AI suggereert, de docent beslist. De knop is een hulpmiddel, geen automatisme.
- **Privacy** — het model draait lokaal via Ollama. Tekeningen van leerlingen worden niet naar externe diensten gestuurd.
- **Transparantie** — de knop is zichtbaar gelabeld als AI-analyse, zodat de docent weet dat het een suggestie betreft.

Dit sluit aan op het kernprincipe van Juf Aimee: *AI ondersteunt de leraar, vervangt deze niet.*

---

## Gebruikersstroom

```
Leerling stuurt tekening in
        ↓
Docent opent opdracht in dashboard
        ↓
Knop "Analyseer tekening" verschijnt
        ↓
Docent klikt → vision model analyseert
        ↓
Feedbacksuggestie verschijnt in tekstbox
        ↓
Docent past aan en slaat op
        ↓
Leerling ziet feedback in leerlingportaal
```

---

## Testplan

*Opdracht genereren*

![alt text](images/opdracht-genereren.png)

*Opdrachtomschrijving*

![alt text](images/gegenereerde-opdracht.png)

*Ingestuurde assignment leerling*

![alt text](images/ingediende-opdracht-daan.png)

*tekening leerling*

![alt text](<mijn fantastisch stad .png>)

*Gegenereerde feedback voor leraar*
![alt text](images/vooringevulde-feedback-leraar.png)

## Technische realisatie

- **API route**: `app/api/analyze-drawing/route.ts`
- **UI component**: `app/dashboard/leerling/[studentId]/opdrachten/[assignmentId]/TeacherFeedbackForm.tsx`
- **Database**: `analysis String?` veld toegevoegd aan `AssignmentSubmission` in `prisma/schema.prisma`
- **Testscript**: `tests/image_analyzer.py`
