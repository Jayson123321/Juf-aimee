# Onderzoek: Waar laten we Juf Aimee op draaien?

**Project:** Juf Aimee – AI-hulp voor hoogbegaafde leerlingen  
**Onderwerp:** Kiezen tussen gratis online modellen (Hugging Face) en betaalde diensten (zoals Gemini)  
**Status:** Concept voor Sprint 2

## 1. Inleiding
Voor Juf Aimee moeten we een keuze maken: gebruiken we een kant-en-klaar model van een groot bedrijf zoals Google, of bouwen we iets met een open-source model dat we zelf kunnen beheren? Omdat dit project valt onder **Responsible AI**, is het niet alleen belangrijk dat de opdrachten goed zijn, maar ook dat we heel voorzichtig omgaan met de gegevens van leerlingen.

## 2. Optie A: Een lokaal model via Hugging Face
Hugging Face is een soort bibliotheek waar je gratis AI-modellen (zoals Llama of Gemma) kunt downloaden en op je eigen computer of een eigen server kunt draaien.

### 2.1 Voordelen
* **Privacy en Veiligheid:** Dit is het grootste pluspunt. Omdat het model lokaal draait, verlaten de gegevens van de leerling nooit onze eigen omgeving. Er gaat niets naar Google of OpenAI. Dit sluit perfect aan bij de eisen van Responsible AI.
* **Eigenaarschap:** Wij zijn de baas over het model. Niemand kan zomaar de regels aanpassen of de toegang blokkeren.
* **Geen verborgen kosten:** Je hoeft niet per vraag te betalen, wat fijn is als leerlingen veel verschillende opdrachten willen uitproberen.

### 2.2 Nadelen
* **Kracht van de computer:** Om een goed model soepel te laten draaien, heb je een sterke computer nodig. Op een simpele laptop kan het erg traag werken.
* **Zelf instellen:** Je moet meer zelf programmeren om het model goed te laten reageren op de interesses van de leerlingen.

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
x
| Wat vinden we belangrijk? | Eigen model (Hugging Face) | Model van bedrijf (Gemini/GPT) |
| :--- | :--- | :--- |
| **Veiligheid van data** | Uitstekend (alles blijft bij ons) | Minder (data gaat naar buiten) |
| **Slimme opdrachten** | Goed (als we het goed instellen) | Zeer goed |
| **Snelheid** | Hangt af van onze computer | Altijd snel |
| **Controle** | Wij zijn de baas | Het bedrijf is de baas |

## 6. Conclusie
Gezien de focus van de opleiding op **Responsible AI**, kiezen wij ervoor om te focussen op een **lokaal model via Hugging Face**. Hoewel een model van een groot bedrijf misschien iets sneller of slimmer is, weegt dat niet op tegen de veiligheid van de leerlinggegevens. Door het model lokaal te draaien, laten we zien dat we privacy serieus nemen en niet afhankelijk willen zijn van grote tech-bedrijven. Dit is de meest verantwoorde weg voor een onderwijsassistent.

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
