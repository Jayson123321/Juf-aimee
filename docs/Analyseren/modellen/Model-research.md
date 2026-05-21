# Onderzoek: Waar laten we Juf Aimee op draaien?

**Project:** Juf Aimee – AI-hulp voor hoogbegaafde leerlingen  
**Onderwerp:** Kiezen tussen gratis online modellen (Hugging Face) en betaalde diensten (zoals Gemini)  
**Status:** Concept voor Sprint 2

## 1. Inleiding
Voor Juf Aimee moeten we een keuze maken: gebruiken we een kant-en-klaar model van een groot bedrijf zoals Google, of bouwen we iets met een open-source model dat we zelf kunnen beheren? Omdat dit project valt onder **Responsible AI**, is het niet alleen belangrijk dat de opdrachten goed zijn, maar ook dat we heel voorzichtig omgaan met de gegevens van leerlingen.

## 2. Optie A: Een model via de Hugging Face API
In deze aanpak gebruiken we een model dat via de Hugging Face Inference API wordt aangeroepen. De prompt wordt dus via internet verstuurd naar Hugging Face, waarna we direct een antwoord terugkrijgen.

### 2.1 Voordelen
* **Snelle implementatie:** We kunnen direct werken met sterke modellen zonder zelf zware hardware te beheren.
* **Schaalbaarheid:** De infrastructuur van Hugging Face vangt pieken in gebruik beter op dan een lokale laptop-opstelling.
* **Flexibiliteit in modelkeuze:** We kunnen sneller wisselen tussen modellen tijdens testen en iteraties.
* **Regie op inrichting:** We houden veel controle over modelkeuze, prompting en veiligheidsregels in onze eigen applicatie.
* **Transparante ontwikkelstap:** De API-route is praktisch voor een proof-of-concept dat snel demo-baar moet zijn.

### 2.2 Nadelen
* **Privacy-risico zonder maatregelen:** Omdat data naar een externe API gaat, mogen we geen direct herleidbare persoonsgegevens meesturen.
* **Afhankelijkheid van externe dienst:** Als beschikbaarheid, limieten of prijzen veranderen, heeft dat direct impact op Juf Aimee.

### 2.3 Privacymaatregel: Pseudonimisering
Omdat de prompt naar Hugging Face wordt verstuurd, voegen we een verplichte pseudonimiseringsstap toe voordat de API-call wordt gedaan.

Concreet betekent dit:
* Namen, adressen, telefoonnummers en e-mails worden vervangen door neutrale labels (bijv. "Leerling-4108").
* Gevoelige context blijft functioneel bruikbaar voor personalisatie, maar is niet direct herleidbaar tot een kind.
* De koppeling tussen pseudoniem en echte identiteit blijft alleen lokaal in een beveiligde omgeving.

Zo combineren we de praktische voordelen van de API met een privacy-aanpak die past bij Responsible AI en AVG-principes.

## 3. Optie B: Praten met een model via een API (bijv. claude)
Hierbij sturen we een vraag via internet naar een groot model van bijvoorbeeld Google en krijgen we direct een antwoord terug.

### 3.1 Voordelen
* **Heel slim:** Deze modellen zijn vaak net iets beter in het begrijpen van ingewikkelde hobby's en kunnen heel creatieve opdrachten bedenken.
* **Snelheid:** Je krijgt bijna meteen antwoord, waardoor de leerling niet hoeft te wachten en lekker door kan werken.

### 3.2 Nadelen
* **Privacy-risico:** De vragen (en dus ook de interesses van de leerling) worden naar servers van een commercieel bedrijf gestuurd. Voor een project over verantwoorde AI is dit een zwak punt.
* **Afhankelijkheid:** Als Google de prijs verhoogt of de dienst aanpast, werkt Juf Aimee misschien niet meer.

## 4 Optie C: Combinatie van LLM en AI frameworks

In dit geval combineren we een large language model van OpenAI of Google wat het standaardmodel gebruikt en aanvullende context voor de antwoorden, in combinatie met Retrieval-Augmented Generation (RAG) en Structuring Augmented Generation (SAG) kunnen de resultaten verder aansluiten op de leerbehoeften van de leerlingen. Met deze techniek is het mogelijk om passend leermateriaal te ontwikkelen doordat oud materiaal, leerprofielen, leertechnieken en observaties van de leraar wordt ingezet. Deze hybride combinatie zou resultaten kunnen geven die de leraar kunnen helpen bij het ondersteunen en ontwikkelen van nieuw leermateriaal voor de leerlingen.

### 4.1 Voordelen
**Nauwkeurigheid** Uit een literatuuronderzoek blijkt dat RAG effectief toegepast kan worden als er sprake is van onjuiste informatie zoals verouderd materiaal en beperkte kennis van een gespecialiseerd onderwerp.
**Structuur** SAG zorgt dat informatie niet alleen uit onderwijsbronnen wordt opgehaald, maar ook gestructureerd wordt verwerkt, waardoor het taalmodel onderwijs passend en overzichtelijk kan genereren en bijvoorbeeld minder kans is dat het gaat hallucineren.

### 4.2 Nadelen
**Snelheid** In geval van grote datasets die worden aangevuld kan het effect hebben op de performance, omdat AI framworks moeten corresponderen en afstemmen met het AI model. Na een analyse van oude en nieuwe inzichten worden de antwoorden gegenereerd gebaseerd op de prompts.

## 5. Overzicht van de verschillen

| Wat vinden we belangrijk? | Open model via Hugging Face API | Model van bedrijf (Gemini/GPT) |
| :--- | :--- | :--- |
| **Veiligheid van data** | Goed (met pseudonimisering voor API-verkeer) | Minder (data gaat naar buiten) |
| **Slimme opdrachten** | Goed (als we het goed instellen) | Zeer goed |
| **Snelheid** | Meestal snel (afhankelijk van API-latency en limieten) | Meestal snel |
| **Controle** | Veel regie op prompt en modelkeuze, maar platformafhankelijk | Minder regie, sterker vendor-afhankelijk |

## 6. Conclusie
Gezien de focus van de opleiding op **Responsible AI**, kiezen wij in deze fase voor een **model via de Hugging Face API**, gecombineerd met **pseudonimisering** als vaste privacymaatregel. Daarmee blijft het project technisch snel uitvoerbaar, terwijl we persoonsgegevens van leerlingen beschermen voordat data het systeem verlaat. Deze aanpak is voor nu de meest haalbare en verantwoorde route voor een werkend prototype van een onderwijsassistent.

**Vooruitblik:** Voor de toekomst is het optimaal om een eigen (GPU-)rig te bouwen waarop we het gekozen open model **lokaal** kunnen draaien. Dat vermindert de afhankelijkheid van externe diensten en maakt het makkelijker om privacy en datastromen volledig in eigen beheer te houden. In de huidige **testfase** is dit echter nog niet realistisch (o.a. vanwege hardware-/inrichtingskosten en doorlooptijd), waardoor we nu bewust kiezen voor de API-aanpak met pseudonimisering.

---

### Bronnen
* **Hugging Face (2026).** *Handleiding voor het lokaal draaien van open AI-modellen.
Relevante sectie: Hoofdstuk 2: Hardware Requirements & Quantization.*
* **Autoriteit Persoonsgegevens (2025).** *Richtlijnen voor AI in de klas en privacy.
Relevante sectie: Sectie 4.1: Grondslagen voor gegevensverwerking.*
* **Kennisnet (2025).** *Veilig gebruik van algoritmes in het basisonderwijs.
Hoofdstuk: Transparantie en Uitlegbaarheid.*
* **Opleiding Responsible AI.** *Projectkaders voor ethiek en databeheer.
Relevante sectie: Kader 2: Dataminimalisatie en Autonomie.*
* **Arxiv.org (2025)** *A Survey on Retrieval And Structuring Augmented Generation with Large Language Models
Relevante sectie: Sectie 3.3: Hybrid Architectures & Latency.*
