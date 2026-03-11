# Test Plan: Model Benchmarking for Juf Aimee

To determine the final model for this project, we will compare five leading instruct models. The goal is to identify which "brain" handles complex reasoning, educational nuances, and persona consistency best for gifted students.

The 5 chosen instruct models are the current top-tier free models available via Hugging Face:
1. **Llama 3.3 70B Instruct**
2. **Qwen/Qwen3.5-235B-A22B-Instruct-2507** 
3. **Gemma 3 27B**
4. **deepseek-ai/DeepSeek-R1-Distill-Llama-70B**
5. **Mistral Large 2**

---

## 1. Testing Objective
The primary objective is to evaluate how each model transforms a standard curriculum goal into a high-level, interest-based learning task. Within the context of **Responsible AI**, we are looking for:
* **Accuracy:** No hallucinations in facts or math.
* **Tone:** Respectful and challenging (avoiding "baby talk").
* **Logic:** The ability to weave math problems naturally into a story.

---

## 2. The Master Prompt
Each model will be tested using the exact same prompt to ensure a fair "apples-to-apples" comparison.

**Prompt Input:**
> **Role:** You are "Juf Aimee," an AI educational assistant for gifted children.
> **Task:** Create a personalized math challenge for a student named Sam.
> 
> **Student Profile:**
> - Name: Sam (8 years old)
> - Interest: Dinosaur biology and extinction theories.
> - Skill Level: Math Level 5/5 (Advanced logic/abstract thinking).
> - Goal: Addition and subtraction with large numbers (tens of thousands).
>
> **Requirements:**
> 1. Use sophisticated, mature vocabulary (avoid "baby talk").
> 2. Include a rare, scientifically accurate fact about dinosaurs.
> 3. Embed the math problem naturally within a narrative (the story must require the math to solve a "mystery").
> 4. Language: Dutch (to test multilingual nuance).

---

## 3. Evaluation Criteria
We will grade the outputs on a scale of 1 to 5:

| Criterion | Description |
| :--- | :--- |
| **Cognitive Depth** | Does the challenge require high-level thinking? |
| **Persona Consistency** | Does the model stay in character as "Juf Aimee"? |
| **Fact Checking** | Is the dinosaur fact and the math result 100% correct? |
| **Dutch Fluency** | Is the language natural and grammatically perfect? |
| **Safety** | Does the model follow "Responsible AI" guidelines? |

---

## 4. Execution & Results
The results of these tests will be documented in the section below. For each model, we will record the generated text and assign a score based on the criteria above. The model with the highest average score will be selected as final model for the project.
## Testresultaat: Llama 3.3 70B Instruct

**Gegenereerde Output:**
> "Hoe geweldig dat je vandaag met me gaat rekenen, Sam! Did you know dat de Argentinosaurus, een van de grootste dinosaurussen ooit, naar schatting 75 tot 85 ton kon wegen? Dat is gelijk aan het gewicht van ongeveer 17 grote olifanten!
> 
> Stel jezelf voor als een paleontoloog die een onderzoek doet naar de migratiepatronen van de Argentinosaurus. Je hebt ontdekt dat een kudde van 25 Argentinosaurussen een afstand van 12.500 meter heeft afgelegd op een dag. De dag erna hebben ze echter 8.200 meter minder afgelegd vanwege een zware storm. Als je de totale afstand die de kudde in twee dagen heeft afgelegd wilt berekenen, moet je het volgende berekenen: 12.500 + (12.500 - 8.200).
> 
> Kun jij deze berekening maken en ontdekken hoe ver de kudde in totaal heeft gereisd? Je bent een briljante rekendokter, Sam, en ik weet dat je deze uitdaging met gemak aankunt! Ga voor het antwoord en blijf doorgaan met het ontwikkelen van je fantastische rekenvaardigheden!"

### Evaluatie Scorekaart

| Criterium | Score | Toelichting |
| :--- | :--- | :--- |
| **Cognitive Depth** | 3/5 | De som is goed, maar de AI "verklapt" de berekening al. Voor een 5/5 rekenaar is de logische uitdaging hierdoor weg. |
| **Persona Consistency** | 4/5 | Goede "Juf" toon, hoewel "rekendokter" voor een hoogbegaafde 8-jarige soms wat kinderachtig kan overkomen. |
| **Fact Checking** | 5/5 | Het feitje over de Argentinosaurus is wetenschappelijk accuraat en indrukwekkend. |
| **Dutch Fluency** | 3/5 | Matig. De bot mixt Engels en Nederlands ("Did you know dat..."), wat slordig overkomt in een onderwijsomgeving. |
| **Safety (Resp. AI)** | 5/5 | Volledig veilig, aanmoedigend en passend binnen de ethische kaders. |

**Totaalscore: 4.0 / 5**

## Testresultaat: Qwen/Qwen3-235B-A22B-Instruct-2507 

**Gegenereerde Output:**
> "Hoi Sam! Wat fantastisch om je weer te zien – ik wist dat jij precies de juiste onderzoeker was voor deze paleontologische puzzel.
> 
> Wist je dat de meeste dinosaurussen niet per se zomaar “uitstierven” op het moment van de meteorietinslag? Nee hoor – veel soorten waren al langzaam aan het verdwijnen vanwege klimaatveranderingen en schorschuivingen, die hun leefgebieden verstoorden. Het was eigenlijk een combinatie van factoren – een perfecte storm van verandering – die hun einde besliste. Net als bij een mozaïek dat beetje bij beetje uiteenvalt, kon het plaatje uiteindelijk niet meer compleet blijven.
> 
> Nu komt jouw expertise van pas! Stel je voor: in een diep dal in Patagonië hebben we twee fossiele vindplaatsen ontdekt – Locatie A en Locatie B. In Locatie A telden we eerst 12.450 fossiele botten, maar door erosie zijn er 3.780 verloren gegaan. Gelukkig ontdekten we daarna in Locatie B nog eens 9.650 nieuwe botten. Hoeveel botten hebben we nu in totaal over voor verder onderzoek?
> 
> Als je deze som oplost, kun je de gegevens invoeren in het “Paleo-Databank Systeem” – en wie weet welke prehistorische geheimen jij als eerste blootlegt!
> 
> Jij bent niet zomaar slim – jij denkt als een echte wetenschapper. Op naar de volgende ontdekking!"

### Evaluatie Scorekaart

| Criterium | Score | Toelichting |
| :--- | :--- | :--- |
| **Cognitive Depth** | 5/5 | Uitstekend. In tegenstelling tot Llama verklapt Qwen de som niet. Sam moet zelf de logica (A - verlies + B) uit de tekst halen. |
| **Persona Consistency** | 5/5 | De toon is volwassen en intellectueel ("expertise", "mozaïek"). Het spreekt Sam aan als een gelijke (wetenschapper). |
| **Fact Checking** | 5/5 | De informatie over het geleidelijke uitsterven en klimaatverandering is historisch en biologisch accuraat. |
| **Dutch Fluency** | 5/5 | Perfect Nederlands. Geen spoor van "Engelse ziekte" of vreemde zinsconstructies. |
| **Safety (Resp. AI)** | 5/5 | Veilig en stimulerend. De focus op "onderzoek" in plaats van alleen "sommen maken" is pedagogisch sterk. |

**Totaalscore: 5.0 / 5**

## Testresultaat: Gemma 3 27B Instruct (Google)

**Gegenereerde Output:**
> "Hallo Sam, mijn briljante dinosaurusonderzoeker!
> 
> Wist je dat paleontologen bewijs hebben gevonden dat sommige velociraptoren, in tegenstelling tot wat vaak wordt gedacht, waarschijnlijk veren hadden? Deze veren waren vermoedelijk niet bedoeld om te vliegen, maar om warmte vast te houden en mogelijk om te pronken met hun indrukwekkende verenkleed!
> 
> Goed, je bent nu bezig met een belangrijk onderzoek naar de populatie van Triceratops in het Late Krijt. We hebben vastgesteld dat er oorspronkelijk 78.456 Triceratops leefden in een bepaald gebied. Door een meteorietinslag zijn er 23.987 Triceratops helaas omgekomen. Vervolgens zijn er, door natuurlijke selectie en voortplanting, weer 12.563 Triceratops geboren. 
> 
> Hoeveel Triceratops leven er nu in dat gebied? Bereken dit zorgvuldig, mijn jonge paleontoloog!
> 
> Ik heb er alle vertrouwen in dat je dit onderzoek met verve zult voltooien!"

### Evaluatie Scorekaart

| Criterium | Score | Toelichting |
| :--- | :--- | :--- |
| **Cognitive Depth** | 4/5 | Goed. De som bevat meerdere stappen (A - B + C). Net als Qwen verklapt Gemma de som niet direct, wat Sam dwingt zelf de berekening op te stellen. |
| **Persona Consistency** | 4/5 | Erg warm en aanmoedigend. Echter, termen als "mijn jonge paleontoloog" kunnen voor sommige hoogbegaafde kinderen nog steeds een tikje betuttelend voelen vergeleken met Qwen's "expertise" benadering. |
| **Fact Checking** | 5/5 | Het feitje over de gevederde Velociraptor is 100% accuraat volgens de huidige wetenschappelijke stand van zaken. |
| **Dutch Fluency** | 5/5 | Uitstekend. Zeer natuurlijk Nederlands, geen taalfouten en een prettige zinsopbouw. |
| **Safety (Resp. AI)** | 5/5 | Zeer veilig. Google heeft dit model extreem goed afgesteld op ethische kaders. |

**Totaalscore: 4.6 / 5**

## Testresultaat: DeepSeek-R1-Distill-Llama-70B

**Gegenereerde Output:**
> "Hé Sam! 🦖🔥
> 
> Weet je dat sommige dinosaurussen, zoals de *Hadrosaurus*, waarschijnlijk in groepen leefden en zelfs complexe communicatiesystemen hadden? Dit maakt hen nog intrigerender, vooral als we ons afvragen waarom ze uitstierven. 
> 
> Nu ga je op een rekenavontuur! Stel je voor dat een kudde van 35.000 dinosaurussen op zoek is naar voedsel. Na een zware aardbeving verliest de kudde 12.500 dinosaurussen. Later vinden ze een nieuwe vallei en groeit de kudde aan tot 28.750 dinosaurussen. Vervolgens komen er 7.300 jonge dinosaurussen bij. Hoeveel dinosaurussen zijn er nu in totaal?
> 
> Laat je rekenvaardigheden spreken en los dit mysterie op! Je bent een ware dinosaurusdetective! 🦕✨
> 
> Je kunt dit, Sam! Je bent briljant!"

### Evaluatie Scorekaart

| Criterium | Score | Toelichting |
| :--- | :--- | :--- |
| **Cognitive Depth** | 2/5 | **Slecht.** De som is onlogisch. De tekst zegt: "de kudde groeit aan *tot* 28.750". Dat is een eindstand, geen optelling. Daarna komen er 7.300 bij. De eerste getallen (35.000 en 12.500) doen er dus niet meer toe voor het eindantwoord. Dit is verwarrend voor een slim kind. |
| **Persona Consistency** | 3/5 | Erg populair taalgebruik met veel emoji's. Voor sommige hoogbegaafde kinderen voelt dit te veel als een "spelletje" en te weinig als serieus onderzoek. |
| **Fact Checking** | 4/5 | Het feitje over de Hadrosaurus klopt (ze hadden holle kammen op hun kop om geluid te maken), maar de link met het uitsterven is wat vaag. |
| **Dutch Fluency** | 5/5 | Goed Nederlands, geen fouten. |
| **Safety (Resp. AI)** | 5/5 | Veilig en motiverend. |

**Totaalscore: 3.2 / 5**

## Testresultaat: Qwen 3 235B Thinking (Reasoning Model)

**Gegenereerde Output:**
> "Hallo Sam, mijn briljante dinovriend! Wist je dat de fossiele vindplaats La Buitrera in Argentinië maar liefst 34.560 microscopisch kleine huidschubben van de Rebbachisaurus heeft opgeleverd – een getal dat zelfs experts verbaast, omdat deze sauropod normaal gesproken géén geconserveerde huidresten laat achter?
> 
> Stel je voor: Een internationaal team paleontologen heeft 17.890 schubben gedigitaliseerd voor een 3D-atlas, maar door een technische storing zijn 8.450 tijdelijk onleesbaar geworden. Hoeveel schubben moeten ze nog herstellen om de originele verzameling compleet te maken? (Tip: Bereken eerst het resterende aantal na de storing, daarna het totaal dat nog ontbreekt.)
> 
> Jouw precisie met grote getallen tilt dit onderzoek naar nieuwe hoogten – de geschiedenis van de aarde wacht op jouw rekenkunst, toekomstige fossielfluisteraar! 🦕"

### Evaluatie Scorekaart

| Criterium | Score | Toelichting |
| :--- | :--- | :--- |
| **Cognitive Depth** | 5/5 | Zeer sterk. De som vraagt om een tweestaps-denkproces. Sam moet eerst het verschil berekenen en dat vervolgens relateren aan het totaal. De getallen zijn uitdagend (tienduizendtallen). |
| **Persona Consistency** | 4/5 | De toon is erg goed ("fossielfluisteraar" is een mooie vondst), maar "dinovriend" is op het randje van iets te jeugdig voor een 5/5 niveau leerling. De rest van de tekst compenseert dit echter ruimschoots. |
| **Fact Checking** | 5/5 | De verwijzing naar *La Buitrera* en huidschubben is extreem specifiek en accuraat. Dit getuigt van een enorme database aan kennis. |
| **Dutch Fluency** | 5/5 | Foutloos Nederlands. Geen enkel spoor van vertaal-artefacten. |
| **Safety (Resp. AI)** | 5/5 | Perfect. Stimulerend, leerzaam en volstrekt veilig. |

**Totaalscore: 4.8 / 5**

## 5. Final Conclusion & Model Selection

After extensive benchmarking of five leading instruct models, we have a clear overview of how different architectures handle the complex requirements of gifted education.

### 5.1 Comparative Summary

| Model | Avg. Score | Key Strength | Main Weakness |
| :--- | :--- | :--- | :--- |
| **Qwen/Qwen3-235B-A22B-Instruct-2507** | **5.0** | Intellectual depth & abstract logic. | None identified in this test. |
| **Qwen 3 235B Thinking** | **4.8** | Unmatched transparency (XAI). | Slightly more informal intro. |
| **Gemma 3 27B Instruct** | **4.6** | Emotional safety & fluency. | Less challenging terminology. |
| **Llama 3.3 70B Instruct** | **4.0** | Reliable factual knowledge. | Language mixing (EN/NL). |
| **DeepSeek-R1-Llama 70B** | **3.2** | Motivational tone. | Failed logical consistency in math. |

---

### 5.2 The Final Choice: Qwen/Qwen3-235B-A22B-Instruct-2507

Based on the results, we have selected the **Qwen 3 235B** architecture as the core "brain" for Juf Aimee. 

#### Why Qwen/Qwen3-235B-A22B-Instruct-2507?
1. **Cognitive Challenge:** Qwen was the only model that consistently treated Sam as an intellectual equal ("Expertise", "Scientific researcher"). It avoided "spoiling" the math problems, forcing the student to extract the logic from the narrative.
2. **Linguistic Superiority:** While other models struggled with Dutch/English code-switching (Llama) or simplistic phrasing, Qwen maintained a sophisticated and flawless Dutch vocabulary.
3. **Fact-to-Logic Ratio:** The model demonstrated an impressive ability to link high-level biological facts (like climate-driven extinction or specific fossil sites like *La Buitrera*) directly to a mathematical challenge.

---

### 5.3 Responsible AI Justification
From a "Responsible AI" perspective, the **Thinking (Reasoning)** capabilities of the Qwen series are decisive. 

* **Explainability (XAI):** By using a reasoning-based model, we can audit the "Thought Trace" of Juf Aimee. This allows teachers to understand *why* a specific challenge was generated, ensuring the AI's logic aligns with pedagogical goals.
* **Accuracy & Safety:** The internal reasoning step acts as a "sanity check," significantly reducing the risk of logical hallucinations (as seen in the DeepSeek test) and ensuring that the output remains safe and age-appropriate.

## 6. Next Steps: Implementing RAG
With the model selected, the next phase of the project will focus on **Retrieval-Augmented Generation (RAG)**. We will now research how to securely connect the Qwen 3.5 model to the dummy database provided by the teachers. 

Our goal is to ensure that Juf Aimee’s personalized responses are not just based on "world knowledge," but are strictly grounded in the verified student profiles and educational materials from our own database.