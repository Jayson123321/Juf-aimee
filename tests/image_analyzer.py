"""
Test LLaVA vision model via Ollama REST API.
Verband met issue #65: tekeningen analyseren voor leraarsfeedback.

Gebruik: python tests/test_llava.py [pad-naar-afbeelding]
"""

import base64
import json
import sys
import urllib.request
import urllib.error
import os

OLLAMA_HOST = "http://localhost:11434"
LLAVA_MODEL = "llava:7b"

PROMPTS = {
    "beschrijving": (
        "Beschrijf zo gedetailleerd mogelijk wat je ziet in deze tekening. "
        "Let op: kleuren,1 vormen, personages, objecten en compositie."
    ),
    "redeneren": (
        "Dit is een simpele tekening van een leerling "
        "Redeneer stap voor stap:\n"
        "1. Wat heeft de leerling getekend en wat wil hij/zij uitdrukken?\n"
        "2. Welke creatieve keuzes zijn gemaakt (kleur, compositie, stijl)?\n"
        "3. Wat zegt de tekening over de creativiteit en het denkniveau van de leerling?\n"
        "4. Welke concrete feedbackpunten kan een leraar geven?"
    ),
    "feedback": (
        "Je bent een onderwijsassistent die een leraar helpt feedback te schrijven "
        "op een tekening van een hoogbegaafde leerling (8-12 jaar). "
        "Schrijf 3 feedbackpunten: wat goed is, wat beter kan, en een uitdagende vervolgvraag."
    ),
}


def encode_image(path: str) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def vraag_llava(image_b64: str, prompt: str) -> str:
    payload = json.dumps({
        "model": LLAVA_MODEL,
        "prompt": prompt,
        "images": [image_b64],
        "stream": True,
    }).encode("utf-8")

    req = urllib.request.Request(
        f"{OLLAMA_HOST}/api/generate",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        full_response = []
        with urllib.request.urlopen(req, timeout=300) as resp:
            for line in resp:
                chunk = json.loads(line.decode("utf-8"))
                token = chunk.get("response", "")
                print(token, end="", flush=True)
                full_response.append(token)
                if chunk.get("done"):
                    break
        print()
        return "".join(full_response)
    except urllib.error.URLError as e:
        return (
            f"FOUT: Kan Ollama niet bereiken op {OLLAMA_HOST}\n"
            f"Zorg dat Ollama draait en LLaVA beschikbaar is:\n"
            f"  ollama pull llava\n"
            f"Details: {e}"
        )
    except Exception as e:
        return f"FOUT: {e}"


if __name__ == "__main__":
    image_path = sys.argv[1] if len(sys.argv) > 1 else "app/Images/Aimee.png"

    if not os.path.exists(image_path):
        print(f"FOUT: Bestand niet gevonden: {image_path}")
        print("Gebruik: python tests/test_llava.py <pad-naar-afbeelding>")
        sys.exit(1)

    print(f"Model  : {LLAVA_MODEL}")
    print(f"Bestand: {image_path}")

    image_b64 = encode_image(image_path)

    for naam, prompt in PROMPTS.items():
        print(f"\n{'='*55}")
        print(f"  {naam.upper()}")
        print(f"{'='*55}")
        resultaat = vraag_llava(image_b64, prompt)
        print(resultaat)

    print(f"\n{'='*55}")
