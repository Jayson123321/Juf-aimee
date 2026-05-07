# Onderzoeksrapport: Modelselectie Juf Aimee (AI-mee)
**Datum:** 4 mei 2026  
**Project:** Hybride AI-onderwijsassistent voor hoogbegaafde leerlingen (6-12 jaar)  
**Hardware Target:** Self-hosted stack van laptopontwikkeling tot 24GB GPU-cloud

---

## 1. De Planner (Opdracht Generatie & RAG)
De Planner fungeert als de didactische architect. De kernvereiste is reasoning: het vermogen om OPP-bronnen, leerkrachtfeedback en Bloom-doelen te vertalen naar een concrete, didactisch passende opdracht.

### Kandidaten & Onderbouwing
1. **Qwen 3 14B**
   * **Onderbouwing:** Deze variant is groot genoeg om sterk te zijn in structuur, redeneren en instructievolging, maar blijft veel realistischer dan extreme modellen zoals `Qwen 3 Next` in een single-GPU pipeline. In Ollama staat `qwen3:14b` rond `9.3GB`, waardoor het op een 24GB kaart nog werkbaar blijft in sequentiële workflows.
2. **Qwen 2.5 7B / 14B**
   * **Onderbouwing:** Qwen2.5 is sterk in meertaligheid, JSON-output en instructievolging. De `7b` en `14b` varianten zijn zeer bruikbaar voor Nederlandse onderwijscontexten en veel beter schaalbaar voor lokale of self-hosted inzet dan zwaardere MoE-modellen.
3. **Qwen 3 Next**
   * **Onderbouwing:** Inhoudelijk is dit een sterke kandidaat, maar praktisch alleen voor high-end of multi-GPU omgevingen. De officiële Ollama library zet `qwen3-next` op ongeveer `50GB`, dus dit is geen middenklasse keuze maar een high-end optie.

---

## 2. De Codeur (Interactieve Opdrachten)
Het genereren van foutloze, veilige en visueel aantrekkelijke HTML5/JS-content.

### Kandidaten & Onderbouwing
1. **Qwen 2.5 Coder (14B)**
   * **Onderbouwing:** Dit is de beste balans tussen codekwaliteit en lokale haalbaarheid. De `14b` variant is duidelijk sterker dan 7B, maar nog steeds realistischer dan 32B+ coder-modellen in een pipeline waar ook vision en image generation meespelen.
2. **Qwen 2.5 Coder (7B)**
   * **Onderbouwing:** De meest praktische keuze voor setups met 8-24GB VRAM. In Ollama staat `qwen2.5-coder:7b` rond `4.7GB`, waardoor het een logische standaardkeuze is als stabiliteit belangrijker is dan maximale codekracht.
3. **Qwen 3 Coder Next**
   * **Onderbouwing:** Een high-end coder-optie voor grotere machines. De officiële Ollama library zet `qwen3-coder-next` op ongeveer `52GB`, dus deze keuze is alleen realistisch in een top-tier of multi-GPU omgeving.

---

## 3. De Visionair (Beeldanalyse & OCR)
Het vertalen van fysieke leerlinginput (werkbladen, schema's, handgeschreven notities) naar bruikbare data.

### Kandidaten & Onderbouwing
1. **Qwen2.5-VL**
   * **Onderbouwing:** Qwen2.5-VL is sterk in documentbegrip, diagrammen, OCR, gestructureerde JSON-output en layout-analyse. Dat maakt dit model het meest logisch voor werkbladen, foto's van schriften en onderwijsgerelateerde visuele taken.
2. **Gemma 3 (12B of 27B)**
   * **Onderbouwing:** Gemma 3 is multimodaal, relatief compact en daardoor aantrekkelijk als vision fallback wanneer één model meerdere rollen moet kunnen vervullen. Voor lichte setups is `gemma3:4b` of `gemma3:12b` bruikbaar; voor sterkere setups kan `gemma3:27b` als rijkere assistent/vision-combinatie dienen.
3. **Llama 4 Maverick (Vision)**
   * **Onderbouwing:** In theorie een sterke vision/redenering-kandidaat, maar minder praktisch voor de huidige self-hosted stack. Daarom is dit eerder een high-end referentie dan een eerste implementatiekeuze.

---

## 4. De Kunstenaar (Beeldgeneratie)
Visuele ondersteuning die tekstuele opdrachten versterkt.

### Kandidaten & Onderbouwing
1. **Stable Diffusion 3.5 Medium**
   * **Onderbouwing:** De meest realistische lokale keuze. Stability AI positioneert dit model expliciet als resource-efficient, met sterke prompt adherence en goede beeldkwaliteit. Voor single-GPU setups is dit de veiligste standaardkeuze.
2. **FLUX.1-Kontext [dev]**
   * **Onderbouwing:** Inhoudelijk zeer aantrekkelijk dankzij in-context editing en consistente personages/objecten. In de praktijk is dit model echter zwaar: het open model is een `12B` image-editing model en de Hugging Face repo toont een groot hoofdbestand van ongeveer `23.8GB`. Daardoor is het op een 24GB GPU alleen haalbaar als andere modellen volledig worden vrijgegeven.
3. **FLUX.1.1 Pro**
   * **Onderbouwing:** Een sterke optie wanneer beeldkwaliteit en prompt adherence topprioriteit zijn, maar deze route is primair API-gebaseerd in plaats van lokaal/self-hosted. Daarmee is het een hybride productiekeuze, geen standaard lokale ontwikkelkeuze.

---

## 5. De Assistent (Didactische Chat)
De interface tussen AI en kind.

### Kandidaten & Onderbouwing
1. **Gemma 3 (12B)**
   * **Onderbouwing:** Een sterke middenweg voor een ondersteunende, veilige en meertalige chatrol. `gemma3:12b` blijft qua geheugen nog praktisch en is rijk genoeg voor didactische begeleiding zonder meteen naar een 20GB+ assistent te gaan.
2. **Mistral Nemo (12B)**
   * **Onderbouwing:** Mistral Nemo is compact, snel en beschikt over een grote context window. Daardoor is het een goede kandidaat voor een responsieve assistentrol in een product waar snelheid en stabiliteit belangrijk zijn.
3. **Llama 3.1 8B**
   * **Onderbouwing:** Een robuust, klein en goed stuurbaar basismodel. Dit blijft interessant wanneer strikte systeem-prompts belangrijker zijn dan maximale modelgrootte.

---

## Bronvermelding & Technische Referenties

* **Ollama.** *Qwen2.5 model library*. https://ollama.com/library/qwen2.5
* **Ollama.** *Qwen3 model library*. https://ollama.com/library/qwen3
* **Ollama.** *Qwen3-Next model library*. https://ollama.com/library/qwen3-next
* **Ollama.** *Qwen2.5-Coder model library*. https://ollama.com/library/qwen2.5-coder
* **Ollama.** *Qwen3-Coder-Next model library*. https://ollama.com/library/qwen3-coder-next
* **Ollama.** *Qwen2.5-VL model library*. https://ollama.com/library/qwen2.5vl
* **Ollama.** *Gemma 3 model library*. https://ollama.com/library/gemma3
* **Ollama.** *Mistral Nemo model library*. https://ollama.com/library/mistral-nemo
* **Ollama.** *Llama 3.1 model library*. https://ollama.com/library/llama3.1
* **Stability AI / Hugging Face.** *Stable Diffusion 3.5 Medium model card*. https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
* **Black Forest Labs / Hugging Face.** *FLUX.1-Kontext-dev model card*. https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev
* **Black Forest Labs / BFL Docs.** *Kontext documentation*. https://docs.bfl.ai/kontext
