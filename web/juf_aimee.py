import os
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), "..", "model.env")
load_dotenv(env_path)

token = os.getenv("HF_TOKEN")

if not token:
    print(f"FOUT: HF_TOKEN niet gevonden op: {env_path}")
    exit()
else:
    print(f"Systeem gestart. Verbinding via: {env_path}")

MODEL_ID = "Qwen/Qwen3-235B-A22B-Instruct-2507" 
client = InferenceClient(model=MODEL_ID, api_key=token)

def vraag_juf_aimee(leerling_data, gebruikers_vraag):
    system_instruction = (
        "Je bent Juf Aimee, een gespecialiseerde AI-onderwijsassistent voor hoogbegaafde kinderen (8-12 jaar). "
        "Je stijl is intellectueel uitdagend, empathisch en wetenschappelijk accuraat. "
        "Spreek de leerling aan als een jonge wetenschapper. Gebruik rijke taal en vermijd betutteling."
    )
    
    volledige_prompt = (
        f"GEGEVENS LEERLING UIT DATABASE:\n{leerling_data}\n\n"
        f"VRAAG VAN DE LEERLING:\n{gebruikers_vraag}"
    )

    messages = [
        {"role": "system", "content": system_instruction},
        {"role": "user", "content": volledige_prompt}
    ]

    print(f"\n[Systeem] Juf Aimee raadpleegt het zwaarste model: {MODEL_ID}...")
    
    try:
        response = client.chat_completion(
            messages, 
            max_tokens=800,
            temperature=0.7 
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"De 235B reus is momenteel niet bereikbaar via de gratis API.\nTip: Gebruik Qwen/Qwen2.5-72B-Instruct als fallback.\n\nFout: {str(e)}"

# --- DE THERIZINOSAURUS UITDAGING ---
dummy_database_info = """
Naam: Sam
Leeftijd: 8 jaar
Interesses: Paleontologie (Therizinosaurus), complexe systemen, anatomie.
Rekenniveau: Groep 8+ (beheerst grote getallen en verhoudingen).
"""

vraag_van_sam = "Bedenk een complexe rekensom over de anatomie en de klauwen van de Therizinosaurus."

# Uitvoeren
resultaat = vraag_juf_aimee(dummy_database_info, vraag_van_sam)

print("\n" + "="*60)
print("ANTWOORD VAN JUF AIMEE (235B):")
print("="*60)
print(resultaat)
print("="*60)