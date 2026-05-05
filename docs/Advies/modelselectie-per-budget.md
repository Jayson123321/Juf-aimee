## 8. Modelselectie per Budget (Realistische lokale/self-hosted configuraties)

Deze sectie vertaalt de eerder onderzochte modellen naar **realistisch werkende configuraties per budget**.
Alle keuzes zijn gebaseerd op:

* VRAM-beperkingen
* Praktijktest: `FLUX.1-Kontext-dev` is op `24GB VRAM` erg krap zodra er ook planner/judge-modellen op dezelfde GPU actief zijn
* Prioriteit: Planner > Assistent > Code > Vision > Image
* Officiële modelgroottes en modelcards van Ollama, Hugging Face en Stability AI

Belangrijke correctie op de eerdere versie:

* `Qwen 3 Next` is **geen** licht of middenklasse model
* De officiële Ollama-library zet `qwen3-next` op ongeveer `50GB`
* `qwen3-coder-next` staat in Ollama op ongeveer `52GB`
* Daarom is `Qwen 3 Next` pas realistisch in een **high-end** of **multi-GPU** setup

Bronnen:

* `Qwen3-Next`: https://ollama.com/library/qwen3-next
* `Qwen3-Coder-Next`: https://ollama.com/library/qwen3-coder-next

---

## ± €1000 (Instap - Laptop)

**Hardware:**

* 16-32GB RAM
* Geen dedicated GPU

**Modelstack:**

* Planner -> `qwen2.5:3b`
* Assistent -> `gemma3:4b`
* Code -> `qwen2.5-coder:3b`
* Vision -> liever cloud/API of overslaan
* Image -> niet lokaal, alleen cloud/API

**Onderbouwing:**

* `qwen2.5:3b` is met ongeveer `1.9GB` een veel realistischer planner-keuze voor een laptop dan zwaardere Qwen-varianten
* `gemma3:4b` is met ongeveer `3.3GB` compact en multimodaal, en daardoor bruikbaar als lichte assistent
* `qwen2.5-coder:3b` is ongeveer `1.9GB` en daardoor de meest logische lokale codekeuze in dit budget
* `Stable Diffusion 3.5 Medium` is wel resource-efficient volgens Stability AI, maar nog steeds geen prettige CPU-laptop keuze

**Bronnen:**

* `Qwen2.5`: https://ollama.com/library/qwen2.5
* `Qwen2.5-Coder`: https://ollama.com/library/qwen2.5-coder
* `Gemma 3`: https://ollama.com/library/gemma3
* `Stable Diffusion 3.5 Medium`: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium

**Beoordeling:**

* + Basis RAG + opdrachtgeneratie
* + Lichte code- en assistentfunctionaliteit
* - Geen prettige lokale vision/image pipeline

**Conclusie:**
Alleen geschikt voor ontwikkeling, testen en text-first prototyping.

---

## ± €2000 (Lichte GPU)

**Hardware:**

* RTX 4060 / 4070
* 8-12GB VRAM
* 32-64GB RAM

**Modelstack:**

* Planner -> `qwen2.5:7b` of `qwen3:8b`
* Assistent -> `mistral-nemo:12b`
* Code -> `qwen2.5-coder:7b`
* Vision -> `gemma3:4b`
* Image -> bij voorkeur cloud/API; lokaal alleen experimenteel

**Onderbouwing:**

* `qwen2.5:7b` is ongeveer `4.7GB`; `qwen3:8b` ongeveer `5.2GB`; beide zijn haalbaar op 8-12GB VRAM als je sequentieel werkt
* `mistral-nemo:12b` is ongeveer `7.1GB` en sterk in zijn grootteklasse
* `qwen2.5-coder:7b` is ongeveer `4.7GB` en daardoor veel realistischer dan 14B/32B coder-modellen
* `gemma3:4b` is de lichtste bruikbare lokale multimodale vision-keuze in Ollama
* `FLUX.1-Kontext-dev` is hier onrealistisch; zelfs `Stable Diffusion 3.5 Medium` is op deze klasse eerder experimenteel dan stabiel

**Bronnen:**

* `Qwen2.5`: https://ollama.com/library/qwen2.5
* `Qwen3`: https://ollama.com/library/qwen3
* `Mistral NeMo`: https://ollama.com/library/mistral-nemo
* `Qwen2.5-Coder`: https://ollama.com/library/qwen2.5-coder
* `Gemma 3`: https://ollama.com/library/gemma3
* `FLUX.1-Kontext-dev`: https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev

**Beoordeling:**

* + Eerste werkende lokale multimodale setup
* + Planner/coder/assistent zijn goed haalbaar
* - Beeldgeneratie blijft de bottleneck

**Conclusie:**
Functioneel voor text, code en lichte vision, maar nog niet ideaal voor lokale image generation.

---

## ± €3000 (Mid-range desktop)

**Hardware:**

* RTX 4070 Ti / 4080
* 12-16GB VRAM
* 64GB RAM

**Modelstack:**

* Planner -> `qwen3:14b`
* Assistent -> `mistral-nemo:12b`
* Code -> `qwen2.5-coder:14b`
* Vision -> `qwen2.5-vl:7b`
* Image -> `Stable Diffusion 3.5 Medium`

**Onderbouwing:**

* `qwen3:14b` is ongeveer `9.3GB` en vormt een duidelijke stap omhoog ten opzichte van 7B/8B zonder meteen in high-end territory te vallen
* `mistral-nemo:12b` blijft hier aantrekkelijk door het relatief lage geheugenverbruik en de grote context
* `qwen2.5-coder:14b` is ongeveer `9.0GB` en realistischer dan een 32B coder-model
* `qwen2.5-vl` wordt door Qwen expliciet gepositioneerd als sterk in documentbegrip, diagrammen en gestructureerde JSON-output
* `Stable Diffusion 3.5 Medium` wordt door Stability AI expliciet omschreven als sterk in promptbegrip en resource-efficiency

**Bronnen:**

* `Qwen3`: https://ollama.com/library/qwen3
* `Mistral NeMo`: https://ollama.com/library/mistral-nemo
* `Qwen2.5-Coder`: https://ollama.com/library/qwen2.5-coder
* `Qwen2.5-VL`: https://ollama.com/library/qwen2.5vl
* `Stable Diffusion 3.5 Medium`: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium

**Beoordeling:**

* + Goede opdrachtkwaliteit
* + Werkende interactieve opdrachten
* + Redelijke lokale vision en bruikbare visuals

**Conclusie:**
Sterke middenklasse setup voor een echt lokaal prototype.

---

## ± €4000-€5000 (Aanbevolen single-GPU setup)

**Hardware:**

* RTX 4090
* 24GB VRAM
* 64-128GB RAM

**Modelstack:**

* Planner -> `qwen3:14b`
* Assistent -> `mistral-nemo:12b`
* Code -> `qwen2.5-coder:14b`
* Vision -> `qwen2.5-vl:7b`
* Image -> `Stable Diffusion 3.5 Medium`

**Onderbouwing:**

* `qwen3:14b` is met ongeveer `9.3GB` sterk genoeg zonder de volledige `24GB` op te eten
* `mistral-nemo:12b` is ongeveer `7.1GB` en blijft daardoor sneller en praktischer op één GPU
* `qwen2.5-coder:14b` is met ongeveer `9.0GB` een goede codekeuze zonder 20GB+ in te gaan
* `qwen2.5-vl:7b` is de logische vision-keuze voor documenten, OCR en layout-analyse
* `Stable Diffusion 3.5 Medium` is op `24GB` de veilige lokale image-keuze
* `FLUX.1-Kontext-dev` is officieel een `12B` image-editing model; de Hugging Face repo toont een groot hoofdbestand van ongeveer `23.8GB`, wat het in een bredere pipeline op `24GB` erg krap maakt

**Bronnen:**

* `Qwen3`: https://ollama.com/library/qwen3
* `Mistral NeMo`: https://ollama.com/library/mistral-nemo
* `Qwen2.5-Coder`: https://ollama.com/library/qwen2.5-coder
* `Qwen2.5-VL`: https://ollama.com/library/qwen2.5vl
* `Stable Diffusion 3.5 Medium`: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
* `FLUX.1-Kontext-dev`: https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev
* `FLUX.1-Kontext-dev` files: https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev/tree/main

**Praktijkbevinding:**

* `FLUX.1-Kontext-dev` werkt op `24GB` alleen als je bijna alle andere modellen eerst volledig uit GPU-geheugen haalt
* In een productflow met planner, coder, judge en image is `Stable Diffusion 3.5 Medium` de stabielere keuze

**Beoordeling:**

* + Beste balans op één GPU
* + Sterke RAG + Bloom-verwerking
* + Goede UX
* - Geen royale ruimte voor high-end FLUX-workflows

**Conclusie:**
> Beste keuze voor Juf Aimee als alles lokaal of self-hosted op één GPU moet draaien.

---

## ± €8000-€10.000 (High-end lokaal)

**Hardware:**

* 48GB VRAM totaal of 2× 24GB GPU
* 128GB RAM

**Modelstack:**

* Planner -> `qwen2.5:32b` of `qwen3:30b`
* Assistent -> `gemma3:27b`
* Code -> `qwen2.5-coder:32b`
* Vision -> `qwen2.5-vl` grotere varianten of aparte vision-inference
* Image -> `FLUX.1-Kontext-dev` of `Stable Diffusion 3.5 Medium`

**Onderbouwing:**

* `qwen2.5:32b` is ongeveer `20GB`, `qwen3:30b` ongeveer `19GB`; vanaf deze klasse worden zulke planners pas echt logisch
* `gemma3:27b` is ongeveer `17GB` en daardoor een echte high-end assistentkeuze
* `qwen2.5-coder:32b` is ongeveer `20GB` en past bij een zwaardere codeworkflow
* `FLUX.1-Kontext-dev` wordt hier realistischer als aparte stap of op een tweede GPU
* `Stable Diffusion 3.5 Medium` blijft de veiligere en efficiëntere fallback

**Bronnen:**

* `Qwen2.5`: https://ollama.com/library/qwen2.5
* `Qwen3`: https://ollama.com/library/qwen3
* `Gemma 3`: https://ollama.com/library/gemma3
* `Qwen2.5-Coder`: https://ollama.com/library/qwen2.5-coder
* `Qwen2.5-VL`: https://ollama.com/library/qwen2.5vl
* `FLUX.1-Kontext-dev`: https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev
* `Stable Diffusion 3.5 Medium`: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium

**Beoordeling:**

* + Veel sterkere reasoning- en codecapaciteit
* + Lokale FLUX wordt voor het eerst serieus bruikbaar
* - Nog steeds slim om text en image sequentieel of gescheiden te draaien

**Conclusie:**
Bijna top-tier lokaal systeem; hier wordt `FLUX` voor het eerst echt geloofwaardig als lokale optie.

---

## €10.000+ (Top-tier lokaal of hybride)

**Hardware:**

* 80GB+ VRAM of multi-GPU
* Bij voorkeur aparte GPU's voor text en image

**Modelstack:**

* Planner -> `qwen3-next`
* Assistent -> `gemma3:27b` of vergelijkbaar high-end model
* Code -> `qwen3-coder-next`
* Vision -> `qwen2.5-vl` grotere varianten of aparte vision-inference
* Image -> `FLUX.1-Kontext-dev` lokaal of `FLUX.1.1 Pro` via API

**Onderbouwing:**

* `qwen3-next` staat officieel in Ollama op ongeveer `50GB` en is dus pas vanaf deze klasse realistisch
* `qwen3-coder-next` staat officieel op ongeveer `52GB` en hoort ook pas hier thuis
* `FLUX.1-Kontext-dev` wordt hier een serieuze lokale image-optie
* `FLUX.1.1 Pro` blijft een API-model en is daarom eerder een hybride dan een puur lokale keuze

**Bronnen:**

* `Qwen3-Next`: https://ollama.com/library/qwen3-next
* `Qwen3-Coder-Next`: https://ollama.com/library/qwen3-coder-next
* `Gemma 3`: https://ollama.com/library/gemma3
* `Qwen2.5-VL`: https://ollama.com/library/qwen2.5vl
* `FLUX.1-Kontext-dev`: https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev
* `BFL Kontext docs`: https://docs.bfl.ai/kontext

**Beoordeling:**

* + Maximale kwaliteit
* + High-end planner en coder eindelijk realistisch
* + FLUX volledig bruikbaar als lokale image-stap

**Conclusie:**
Hier worden `Qwen 3 Next` en `Qwen 3 Coder Next` voor het eerst echt logisch.

---

# Samenvattende Conclusie

* Bij `24GB VRAM` (bijvoorbeeld een `RTX 4090` of `NVIDIA A10`):

  * + `Qwen3:14b`, `Qwen2.5-Coder:14b`, `Mistral-NeMo:12b` en `Qwen2.5-VL:7b` zijn realistische keuzes
  * - `FLUX.1-Kontext-dev` blijft krap zodra er ook andere modellen op dezelfde GPU meedraaien
  * + `Stable Diffusion 3.5 Medium` is het beste lokale beeldalternatief

* Grootste bottleneck:
  > Beeldgeneratie

* Grootste correctie ten opzichte van de eerdere versie:
  > `Qwen 3 Next` is geen middenklasse model, maar een high-end model van ongeveer `50GB`

* Beste setup voor dit project op één GPU:

> **Qwen3:14b + Qwen2.5-Coder:14b + Mistral-Nemo:12b + Qwen2.5-VL:7b + Stable Diffusion 3.5 Medium**

Dit biedt:

* stabielere performance
* goede didactische kwaliteit
* realistische hardware-eisen
* een veel geloofwaardiger lokale pipeline dan een stack met `Qwen 3 Next`

---
