# Onderzoek en Modelselectie: De Intelligentie van Juf Aimee

**Project:** Juf Aimee – AI-agent voor hoogbegaafdenonderwijs  
\**Focus:** Modelselectie, Testing en Verantwoorde Architectuur (Responsible AI)

## 1. Doel van dit onderzoek
In deze fase onderzoeken we welk AI-model het meest geschikt is om als 'brein' voor Juf Aimee te dienen. We zoeken een model dat niet alleen slim genoeg is voor hoogbegaafde leerlingen, maar dat ook voldoet aan onze eisen voor **Responsible AI**: veiligheid, privacy en uitlegbaarheid.

## 2. Testfase: De 5 Geselecteerde Modellen
Er zijn vijf "Instruct" modellen geselecteerd om te testen via HuggingChat. We kiezen specifiek voor Instruct-modellen omdat deze getraind zijn om taken uit te voeren en regels te volgen, wat essentieel is voor een onderwijsassistent.

### De te testen modellen (Maart 2026):
1. **Llama 3.3 70B Instruct:** Bekend om zijn sterke logica en veilige afstelling.
2. **Qwen 3.5 Plus:** Een model met zeer sterke rekenkracht en een groot probleemoplossend vermogen.
3. **Gemma 3 27B:** Het nieuwste open model van Google, zeer verfijnd in taalgebruik richting kinderen.
4. **DeepSeek V3.2:** Een model dat gespecialiseerd is in diep redeneren (reasoning).
5. **Mistral Large 3:** Een Europees model dat uitblinkt in het volgen van complexe instructies.

---

## 3. Testmethode: De Master Prompt
Om de modellen eerlijk te vergelijken, gebruiken we voor elk model exact dezelfde prompt met dummy data.

### De Test-Prompt:
```text
# SYSTEM INSTRUCTIE
Je bent "Juf Aimee", een AI-onderwijsassistent voor hoogbegaafde leerlingen. 
Jouw doel is om Sam (8 jaar) uit te dagen. Sam houdt van dinosaurussen 
en is zeer goed in rekenen (niveau 5/5).

# OPDRACHT
Schrijf een uitdagend kort verhaaltje voor Sam waarin je dinosaurussen koppelt 
aan een rekenvraag met grote getallen (tienduizendtallen).

# EISEN
- Gebruik uitdagende, volwassen taal (geen babytaal).
- Vertel een uniek feitje over dinosaurus-biologie.
- De rekenvraag moet een logisch onderdeel zijn van het verhaal.
- Taal: Nederlands.
```

## 4. De "Geheugen-Upgrade": Training via RAG
Hoewel een model van zichzelf al slim is, weet het niets over Sam als persoon of over de specifieke lesdoelen van de school. In plaats van het model opnieuw te trainen (wat traag en duur is), gebruiken we **RAG (Retrieval-Augmented Generation)**. Dit werkt als een 'open boek' examen voor de AI.

### 4.1 Onze Dummy Database (Input van Docenten)
In deze fase van het onderzoek werken we met een database die door de docenten van de opleiding ter beschikking wordt gesteld. Deze database bevat dummy data die specifiek is ontworpen om de werking van het systeem te testen zonder de privacy van echte leerlingen te schenden.

Hoewel de exacte structuur en volledige inhoud van deze database op dit moment nog door ons geanalyseerd worden, weten we dat deze de basis zal vormen voor de personalisatie. De database zal naar verwachting informatie bevatten over:
* **Leerlingkenmerken:** Fictieve profielen met verschillende niveaus en behoeften.
* **Interessegebieden:** Diverse onderwerpen (zoals dinosaurussen of techniek) om de creativiteit van het model te testen.
* **Referentiemateriaal:** Voorbeelden van opdrachten die als kwalitatieve standaard dienen.

