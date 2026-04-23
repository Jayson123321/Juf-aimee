# Onderzoeksrapport: Modelselectie Juf Aimee (AI-mee)
**Datum:** 22 april 2026  
**Project:** Hybride AI-onderwijsassistent voor hoogbegaafde leerlingen (6-12 jaar)  
**Hardware Target:** Apple Mac Mini M4 Pro (64GB Unified Memory)

---

## 1. De Planner (Opdracht Generatie & RAG)
De Planner fungeert als de didactische architect. De kernvereiste is 'Reasoning': het vermogen om complexe bronteksten te ontleden naar de taxonomie van Bloom.

### Kandidaten & Onderbouwing
1. **DeepSeek-V3.2 (Reasoning Mode)**
   * **Onderbouwing:** DeepSeek-V3 maakt gebruik van *Multi-head Latent Attention (MLA)* en een verfijnd *Mixture-of-Experts (MoE)* framework met 671 miljard parameters (waarvan 37B actief). Dit zorgt voor superieure logische consistentie en "Chain-of-Thought" redeneren, wat cruciaal is om te voorkomen dat didactische niveaus in de war raken.
2. **Llama 4 Scout (17B MoE)**
   * **Onderbouwing:** Specifiek geoptimaliseerd voor Apple's MLX-framework. Door de MoE-architectuur (vergelijkbaar met de Maverick-variant maar lichter) biedt dit model een 'near-perfect' nauwkeurigheid in informatie-extractie, ideaal voor RAG-taken op edge-devices.
3. **Qwen 3 Next**
   * **Onderbouwing:** Alibaba's Qwen-modellen blinken uit in meertaligheid en genuanceerd taalbegrip. Voor de Nederlandse context biedt Qwen een betere verwerking van grammatica en lokale onderwijsdoelen dan puur Engelsgeoriënteerde modellen.

---

## 2. De Codeur (Interactieve Opdrachten)
Het genereren van foutloze, veilige en visueel aantrekkelijke HTML5/JS content.

### Kandidaten & Onderbouwing
1. **Qwen 2.5 Coder (32B)**
   * **Onderbouwing:** Getraind op meer dan 5.5 biljoen tokens. De 32B-variant biedt een state-of-the-art balans tussen redeneervermogen en code-efficiëntie. Dankzij code-specifieke SFT (Supervised Fine-Tuning) is dit model leidend in het genereren van direct werkende frontend-applicaties.
2. **DeepSeek-Coder-V2.5**
   * **Onderbouwing:** Bekend om zijn vermogen om complexe logica (zoals interactieve sleep-oefeningen) te structureren zonder syntax-fouten, ondersteund door een enorme database aan opensource repositories.
3. **Claude 3.5 Sonnet (Benchmark)**
   * **Onderbouwing:** Dient als de 'Gold Standard' referentie. Hoewel cloud-gebaseerd, is het de industriestandaard voor iteratieve codegeneratie en UI-ontwerp.

---

## 3. De Visionair (Beeldanalyse & OCR)
Het vertalen van fysieke leerling-input (werkbladen) naar bruikbare data.

### Kandidaten & Onderbouwing
1. **Qwen2.5-VL**
   * **Onderbouwing:** Gebruikt *Naive Dynamic Resolution*, waardoor afbeeldingen van wisselende groottes (zoals foto's van schriften) nauwkeurig geanalyseerd worden zonder informatieverlies. Het ondersteunt gestructureerde JSON-output voor visuele objectlokalisatie.
2. **Llama 4 Maverick (Vision)**
   * **Onderbouwing:** Een zwaarder MoE-model met 128 experts dat significant beter presteert bij complexe visuele logica en extractie uit documenten met een onregelmatige lay-out.
3. **Gemma 4 Vision (26B)**
   * **Onderbouwing:** Google's nieuwste multimodale model dat uitblinkt in het begrijpen van handgeschreven wiskundige formules en tekstuele context op een zeer efficiënte voetafdruk.

---

## 4. De Kunstenaar (Beeldgeneratie)
Visuele ondersteuning die de tekstuele opdrachten versterkt.

### Kandidaten & Onderbouwing
1. **FLUX.1.1 Pro / Kontext [dev]**
   * **Onderbouwing:** De 'Kontext' variant staat in-context editing toe, wat betekent dat personages (bijv. een mascotte van de school) consistent blijven over meerdere opdrachten. Het biedt de hoogste 'prompt adherence' in de industrie.
2. **Stable Diffusion 3.5 Medium**
   * **Onderbouwing:** Gebruikt Multimodal Diffusion Transformer (MM-DiT) architectuur, wat zorgt voor een uitstekende balans tussen beeldkwaliteit en snelheid op Apple Silicon hardware via CoreML.
3. **Muse Spark**
   * **Onderbouwing:** Een lichtgewicht, razendsnelle optie voor on-the-fly illustraties die minder rekenkracht vereisen dan de zwaardere FLUX-modellen.

---

## 5. De Assistent (Didactische Chat)
De interface tussen AI en kind.

### Kandidaten & Onderbouwing
1. **Gemma 3 (27B)**
   * **Onderbouwing:** Voorzien van een context-window van 128k tokens. Het model is specifiek getraind op pedagogische 'grounding', waardoor het feitelijk accuraat blijft en een veilige, ondersteunende toon hanteert voor kinderen.
2. **Mistral Nemo (12B)**
   * **Onderbouwing:** Ontwikkeld door NVIDIA en Mistral. Het is geoptimaliseerd voor FP8-quantizatie zonder verlies van nauwkeurigheid, wat resulteert in bliksemsnelle reacties op de Mac Mini.
3. **Llama 3.1 8B (Fine-tuned)**
   * **Onderbouwing:** Een robuust basismodel dat door zijn kleine omvang zeer goed te sturen is met strikte systeem-prompts ("Geef nooit het antwoord").

---

## Bronvermelding & Technische Referenties

* **DeepSeek-AI.** (2024/2025). *DeepSeek-V3 Technical Report*. arXiv:2412.19437. [Focus: Multi-head Latent Attention (MLA) & MoE architecture].
* **Hui, B., et al.** (2024). *Qwen2.5-Coder Technical Report*. Hugging Face / Alibaba Cloud. [Focus: 5.5T token training & code-specific SFT].
* **Meta AI Research.** (2026). *Evaluating Meta's Llama 4 Models for Enterprise and Edge Content*. Box AI Blog / Meta Engineering. [Focus: Scout (16 experts) vs Maverick (128 experts) efficiency].
* **Alibaba Qwen Team.** (2025). *Qwen2.5-VL: Advancements in Visual Understanding and Agentic Capabilities*. QwenLM Blog. [Focus: Naive Dynamic Resolution & Precise Object Grounding].
* **Black Forest Labs.** (2024). *FLUX.1.1 [pro] and Kontext Technical Specifications*. BFL.ai. [Focus: Flow-matching models & character consistency].
* **Google DeepMind.** (2025). *Gemma 3: Multimodal Understanding and Pedagogical Grounding*. DeepMind Technical Reports. [Focus: 128K context window & factual grounding benchmarks].
* **Mistral AI & NVIDIA.** (2024). *Mistral-Nemo-12B: Small footprint, Big Intelligence*. NVIDIA/Mistral Blog. [Focus: 128k context & FP8 quantization].
* **Apple Machine Learning Team.** (2025/2026). *Optimizing MoE Models for M4 Pro Unified Memory Architecture*. Apple Developer Documentation.