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

    print(f"\n[Systeem] Juf Aimee raadpleegt model: {MODEL_ID}...")
    
    try:
        response = client.chat_completion(
            messages, 
            max_tokens=800,
            temperature=0.7 
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"De 235B reus is momenteel niet bereikbaar via de gratis API.\nTip: Gebruik Qwen/Qwen2.5-72B-Instruct als fallback.\n\nFout: {str(e)}"

# --- FICTIEVE LEERLING: JULIA VAN LOON (OPP VOORBEELD) ---
dummy_database_info = """
Naam: Julia van Loon
Geboortedatum: 17-02-2015
Leeftijd: 10 jaar
Geslacht: Vrouw
School: Spinaker
Huidig schooljaar en groep: 2024-2025, groep 6
Leerkracht: Juf Marit

Cognitief profiel (WISC-V, 11-03-2024):
  TIQ: 142 | Verbaal Begrip: 148 | Visueel Ruimtelijk: 129
  Fluïde Redeneren: 136 | Werkgeheugen: 122 | Verwerkingssnelheid: 103

Didactisch niveau (per juni 2025):
  Rekenen: I+ / DLE 62 (groep 8+)
  Begrijpend lezen: I+ / DLE 60 (groep 8+)
  Technisch lezen: I+ / DLE 64 (groep 8+) / AVI Plus
  Spelling: I / DLE 53

Sterke punten:
  - Uitzonderlijk verbaal redeneervermogen en rijke woordenschat
  - Legt snel verbanden in complexe leerstof
  - Sterk in tekstanalyse en onderbouwde argumentatie
  - Werkt langdurig geconcentreerd bij uitdagende opdrachten
  - Empathisch, reflectief en geeft genuanceerd antwoord

Aandachtspunten:
  - Perfectionisme en faalangst: blokkeert wanneer iets niet direct perfect lukt
  - Opstarten en plannen van taken kost moeite bij lage motivatie
  - Vermijdingsgedrag bij herhaling en automatisering
  - Werktempo in schriftelijke verwerking lager dan denkniveau
  - Sociale flexibiliteit en samenwerken vragen aandacht

Onderwijsbehoefte:
  - Compact aanbod met verrijking, verdieping en open opdrachten
  - Onderzoekend leren met autonomie binnen kaders
  - Expliciete begeleiding bij executieve functies (plannen, starten, afronden)
  - Prikkelreductie, visuele planning en korte evaluatiemomenten
  - Normaliseren van fouten maken

Uitstroomverwachting: VWO / Gymnasium
Huidige begeleiding: Praktijk Denkruimte (hoogbegaafdheid)
Diagnose: Geen classificatie (DSM-V)
"""

vraag_van_julia = "Ik snap niet hoe het kan dat licht tegelijk een golf en een deeltje is. Dat lijkt toch een tegenstrijdigheid?"


resultaat = vraag_juf_aimee(dummy_database_info, vraag_van_julia)

print("\n" + "="*60)
print("ANTWOORD VAN JUF AIMEE AAN JULIA (235B):")
print("="*60)
print(resultaat)
print("="*60)