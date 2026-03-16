# Sprint Review – Sprint 1

**Project:** Juf Aimee – AI-onderwijsassistent voor hoogbegaafde leerlingen  
**Sprint periode:** Sprint 1  
**Datum review:** 17 maart 2026  

---

## Bijdrage van Ruben

In deze sprint heb ik mij vooral gericht op het onderzoeken en opzetten van de technische basis voor Juf Aimee.

### 1. Modelonderzoek en modelselectie

Als eerste heb ik verschillende AI-modellen geanalyseerd om te bepalen welk model het meest geschikt is voor de doelgroep: hoogbegaafde leerlingen van ongeveer 8-12 jaar. Hiervoor heb ik meerdere instruct-modellen getest met dezelfde testprompt ("master prompt") en gekeken naar onder andere cognitieve diepgang, taalgebruik in het Nederlands, persona-consistentie en mogelijke hallucinaties.

| Model | Avg. Score | Sterk punt | Zwak punt |
| :--- | :---: | :--- | :--- |
| Qwen/Qwen3-235B-A22B-Instruct-2507 | 5.0 | Sterk in abstract redeneren en taal | Geen duidelijke zwakke punten |
| Qwen 3 235B Thinking | 4.8 | Veel transparantie (XAI) | Intro iets informeler |
| Gemma 3 27B Instruct | 4.6 | Goede toon en veiligheid | Minder uitdagend |
| Llama 3.3 70B Instruct | 4.0 | Betrouwbare kennis | Soms mix NL/EN |
| DeepSeek-R1-Llama 70B | 3.2 | Motiverende toon | Logische fouten bij rekenen |

Uit deze analyse kwam Qwen3-235B-A22B-Instruct-2507 als beste naar voren. Op basis daarvan heb ik geadviseerd om dit model als primair model voor Juf Aimee te gebruiken, omdat het het beste presteert op taal, redeneervermogen en het volgen van complexe instructies.

### 2. Werkend prototype met API-koppeling

Naast het modelonderzoek heb ik ook een eerste werkend prototype gebouwd in Python (juf_aimee.py). Dit script maakt verbinding met de Hugging Face Inference API via een HF_TOKEN, stuurt een leerlingprofiel mee als context en gebruikt een system instruction om de persona van Juf Aimee consistent te houden. Voor het testen heb ik gewerkt met een fictief leerlingprofiel gebaseerd op een realistisch OPP (Julia van Loon, 10 jaar, TIQ 142, groep 6).

### 3. Lokale chatinterface op localhost

Om het prototype demonstreerbaar te maken heb ik een eenvoudige webinterface gebouwd (chat_server.py) met Flask. Deze draait lokaal op http://localhost:5000 en bevat:

- een **chatvenster** met berichtbubbels (leerling rechts, Juf Aimee links)
- een **typingindicator** terwijl het model antwoord genereert
- automatisch meesturen van het leerlingprofiel bij iedere vraag

De interface is bedoeld als proof-of-concept en zal vervangen worden.

**Starten:**
```bash
cd web
python chat_server.py
```

### 4. Privacyverkenning: anonimisering en pseudonimisering

Tijdens deze sprint heb ik ook kort gekeken naar de privacykant van het project, omdat Juf Aimee uiteindelijk met leerlingdata gaat werken. Omdat de AI via een externe API draait, valt het versturen van persoonsgegevens onder de AVG. Een belangrijke bevinding is dat leerlingdata daarom eerst geanonimiseerd of gepseudonimiseerd moet worden voordat deze naar een extern model wordt gestuurd. Dit is iets waar in een volgende sprint verder naar gekeken zal worden.

### 5. Werkwijze in de sprint

Gedurende de sprint heb ik mijn werk iteratief opgebouwd: eerst modelanalyse, daarna een prototype en vervolgens een eenvoudige interface om het systeem te testen. Door deze stappen te documenteren en modulair op te zetten blijft het project goed uitbreidbaar voor de volgende sprints.

### 6. Volgende sprint

Volgende sprint wil ik mij richten op:

- het integreren van een RAG-structuur met een database voor leerlingprofielen
- het onderzoeken hoe pseudonimisering van leerlingdata automatisch kan worden toegepast voordat data naar de API wordt gestuurd


