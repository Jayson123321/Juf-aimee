# Technische Handleiding AI Runtime

## Doel

Deze handleiding beschrijft hoe de AI-runtime van Juf Aimee is opgebouwd, welke modellen momenteel actief zijn, hoe de image-service en de leerlingchat samenwerken en welke configuratie nodig is om alles lokaal en via SURF Research Cloud te laten draaien.

De handleiding is bedoeld voor ontwikkelaars die:

- de opdrachtgenerator willen starten of aanpassen
- de leerlingchat in de sidebar willen uitbreiden
- de image-modellen willen wisselen
- de cloudopstelling opnieuw willen opstarten na een reboot of resume

---

## Overzicht architectuur

De huidige runtime bestaat uit drie hoofdonderdelen:

1. **Next.js app lokaal**
   Deze draait op de ontwikkelmachine en verwerkt de pagina's, API-routes en de UI.

2. **Ollama op Ubuntu / SURF Research Cloud**
   Deze verzorgt de taalmodellen voor:
   - opdrachtgeneratie
   - denktips
   - leerlingchat
   - judge
   - embeddings

3. **Image-service op Ubuntu / SURF Research Cloud**
   Deze draait als aparte FastAPI-service en maakt illustraties voor opdrachten.

De lokale app praat met de cloud via SSH-tunnels.

---

## Huidige modelkeuzes

### Tekst en chat

- `GEN_MODEL = qwen3:14b`
- `ASSISTANT_MODEL = mistral-nemo:12b`
- `JUDGE_MODEL = vicgalle/prometheus-7b-v2.0:latest`
- `EMBED_MODEL = jeffh/intfloat-multilingual-e5-large:f16`

### Afbeeldingen

Voor een setup met ongeveer `24GB VRAM` is de stabiele standaard:

- `Stable Diffusion 3.5 Medium`

`FLUX.1-Kontext-dev` is niet meer de standaard voor hergeneratie, omdat dit op een `24GB` kaart te vaak tegen `CUDA out of memory` aanloopt.

Als later toch weer met FLUX geëxperimenteerd wordt, kan dat expliciet via aparte edit-configuratie.

---

## Belangrijkste bestanden

### Opdrachtgeneratie

- `app/api/assign/route.ts`
- `lib/ollama.ts`
- `lib/judge.ts`
- `lib/assignment-image.ts`

### Leerlingchat

- `app/api/prototype/student-chat/route.ts`
- `app/student/[id]/chat/StudentChatClient.tsx`
- `app/student/[id]/opdrachten/[assignmentId]/AssignmentWorkspaceClient.tsx`
- `app/student/[id]/opdrachten/[assignmentId]/MultipleChoiceClient.tsx`
- `app/student/[id]/opdrachten/[assignmentId]/page.tsx`

### Image runtime

- `scripts/assignment_image_service.py`
- `scripts/generate_assignment_image.py`

---

## Sidebar-chat: huidig gedrag

De sidebar-chat is nu **opdrachtspecifiek**.

Dat betekent:

- op de opdrachtpagina start de chat met de **huidige opdracht**
- de chat krijgt het **leerlingprofiel** en relevante **OPP-context**
- de chat krijgt ook de **huidige tekst in het werkvak** mee op het moment dat de leerling een bericht verstuurt
- bij een meerkeuzevraag krijgt de chat de **actuele vraagtekst** mee

### Belangrijke ontwerpkeuze

De algemene leerlingchat en de opdracht-sidebar zijn functioneel van elkaar gescheiden:

- de losse chatpagina mag de bredere chatgeschiedenis blijven gebruiken
- de opdracht-sidebar start bewust **vers**, zodat oude context van een andere opdracht niet per ongeluk wordt hergebruikt

### Promptregels van de sidebar-chat

De assistent is zo geconfigureerd dat hij:

- in eenvoudig Nederlands praat
- kindvriendelijk reageert
- geen direct antwoord weggeeft
- geen juiste meerkeuzeletter noemt
- opdrachten behandelt als **schoolsituaties**, niet automatisch als letterlijke gebeurtenissen uit het echte leven van het kind
- helpt met:
  - hints
  - denkstappen
  - sleutelwoorden
  - een beginplan

---

## Image-runtime: huidig gedrag

De image-service gebruikt nu twee onafhankelijke configuraties:

- `render` voor de eerste afbeelding
- `edit` voor het opnieuw genereren van een afbeelding

### Huidige standaard

Zonder extra overrides draait beide op:

- `Stable Diffusion 3.5 Medium`

### Waarom

Op een `24GB VRAM` kaart bleek:

- de eerste render met `SD3` stabiel
- hergeneratie met `FLUX` instabiel door VRAM-tekorten

Daarom is de standaard nu bewust conservatief ingesteld.

---

## Belangrijke environment variables

### Lokaal in `.env`

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/juf-aimee"
EMBED_MODEL="jeffh/intfloat-multilingual-e5-large:f16"
GEN_MODEL=qwen3:14b
OLLAMA_HOST=http://127.0.0.1:11435
ASSISTANT_MODEL=mistral-nemo:12b
ASSIGNMENT_IMAGE_API_URL=http://127.0.0.1:8000/generate
```

### Op Ubuntu voor de image-service

```bash
export ASSIGNMENT_IMAGE_RENDER_MODEL_FAMILY=sd3
export ASSIGNMENT_IMAGE_RENDER_MODEL_PATH=/mnt/scratch/models/stable-diffusion-3.5-medium
export ASSIGNMENT_IMAGE_EDIT_MODEL_FAMILY=sd3
export ASSIGNMENT_IMAGE_EDIT_MODEL_PATH=/mnt/scratch/models/stable-diffusion-3.5-medium
export ASSIGNMENT_IMAGE_OUTPUT_DIR=/mnt/scratch/generated/assignment-images
export ASSIGNMENT_IMAGE_ESTIMATED_SECONDS=90
export ASSIGNMENT_IMAGE_CPU_OFFLOAD=1
export ASSIGNMENT_IMAGE_WIDTH=768
export ASSIGNMENT_IMAGE_HEIGHT=768
export ASSIGNMENT_IMAGE_STEPS=16
export ASSIGNMENT_IMAGE_UNLOAD_AFTER_REQUEST=1
export PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True
```

---

## Opstartvolgorde

### 1. SSH-tunnel vanaf Windows

```powershell
ssh -L 8000:localhost:8000 -L 11435:localhost:11434 rplat@ubuntudesktop.rai-06-hva.src.surf-hosted.nl
```

Laat dit venster open.

### 2. Ollama op Ubuntu

```bash
ollama serve
```

Laat dit venster open.

### 3. Image-service op Ubuntu

```bash
cd ~/studio-rai-group-project-q129
git pull
source .venv/bin/activate
export ASSIGNMENT_IMAGE_RENDER_MODEL_FAMILY=sd3
export ASSIGNMENT_IMAGE_RENDER_MODEL_PATH=/mnt/scratch/models/stable-diffusion-3.5-medium
export ASSIGNMENT_IMAGE_EDIT_MODEL_FAMILY=sd3
export ASSIGNMENT_IMAGE_EDIT_MODEL_PATH=/mnt/scratch/models/stable-diffusion-3.5-medium
export ASSIGNMENT_IMAGE_OUTPUT_DIR=/mnt/scratch/generated/assignment-images
export ASSIGNMENT_IMAGE_ESTIMATED_SECONDS=90
export ASSIGNMENT_IMAGE_CPU_OFFLOAD=1
export ASSIGNMENT_IMAGE_WIDTH=768
export ASSIGNMENT_IMAGE_HEIGHT=768
export ASSIGNMENT_IMAGE_STEPS=16
export ASSIGNMENT_IMAGE_UNLOAD_AFTER_REQUEST=1
export PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True
python -m uvicorn scripts.assignment_image_service:app --host 0.0.0.0 --port 8000
```

### 4. Modellen pullen op Ubuntu

Voor de huidige setup zijn minimaal deze modellen nodig:

```bash
ollama pull qwen3:14b
ollama pull qwen2.5-coder:7b
ollama pull vicgalle/prometheus-7b-v2.0:latest
ollama pull jeffh/intfloat-multilingual-e5-large:f16
ollama pull mistral-nemo:12b
```

### 5. Lokale Next app starten

```powershell
npm run dev
```

---

## Model wisselen

### Sidebar-assistent wisselen

Pas lokaal in `.env` aan:

```env
ASSISTANT_MODEL=mistral-nemo:12b
```

of:

```env
ASSISTANT_MODEL=llama3.1:8b
```

Daarna de lokale devserver herstarten:

```powershell
npm run dev
```

### Image-model wisselen

Voor alleen de edit-stap:

```bash
export ASSIGNMENT_IMAGE_EDIT_MODEL_FAMILY=flux
export ASSIGNMENT_IMAGE_EDIT_MODEL_PATH=/mnt/scratch/models/FLUX.1-Kontext-dev
```

Voor de veilige standaard:

```bash
export ASSIGNMENT_IMAGE_EDIT_MODEL_FAMILY=sd3
export ASSIGNMENT_IMAGE_EDIT_MODEL_PATH=/mnt/scratch/models/stable-diffusion-3.5-medium
```

Daarna de image-service opnieuw starten.

---

## Testchecklist

Gebruik na een wijziging deze korte checklist:

1. Open een opdracht via `Start opdracht`
2. Controleer of de sidebar-chat een **verse opdrachtcontext** gebruikt
3. Typ iets in het werkvak
4. Stel een vraag in de sidebar
5. Controleer of de assistent:
   - naar de huidige opdracht verwijst
   - kindvriendelijk blijft
   - geen volledig antwoord weggeeft
6. Genereer een eerste afbeelding
7. Genereer dezelfde afbeelding opnieuw
8. Controleer welk model in de UI-badge staat

---

## Bekende aandachtspunten

### 1. Vergeten SSH-tunnel

Symptoom:

- `fetch failed`
- image-service niet bereikbaar
- Ollama niet bereikbaar vanaf lokaal

Controle:

```powershell
curl -UseBasicParsing http://127.0.0.1:8000/health
```

### 2. Oude opdrachtcontext in de chat

Dit hoort nu niet meer te gebeuren op de opdrachtpagina.

Als dat toch gebeurt:

- controleer of de nieuwste frontendcode draait
- herstart `npm run dev`

### 3. CUDA out of memory

Meest voorkomende oorzaken:

- te zwaar image-model
- FLUX edit op 24GB
- meerdere Ollama-modellen tegelijk warm op GPU

Oplossing:

- houd `SD3` als standaard
- laat modellen na gebruik unloaden
- herstart bij twijfel de image-service

---

## Samenvatting

De huidige technische keuze is:

- stabiele tekstgeneratie en judge via Ollama
- kindvriendelijke sidebar-chat met actuele opdrachtcontext
- `Stable Diffusion 3.5 Medium` als veilige standaard voor `24GB VRAM`
- expliciete configuratiepunten om later per onderdeel weer te wisselen

Deze opzet is niet de meest experimentele, maar wel de meest stabiele voor de huidige hardware en workflow.
