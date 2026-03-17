import os
import json
import re
from flask import Flask, request, jsonify, render_template_string
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), "..", "model.env")
load_dotenv(env_path)

token = os.getenv("HF_TOKEN")
if not token:
    print(f"FOUT: HF_TOKEN niet gevonden op: {env_path}")
    exit()

MODEL_ID = "Qwen/Qwen3-235B-A22B-Instruct-2507"
FALLBACK_MODEL_ID = "Qwen/Qwen2.5-72B-Instruct"
client = InferenceClient(model=MODEL_ID, api_key=token)
fallback_client = InferenceClient(model=FALLBACK_MODEL_ID, api_key=token)

LEERLING_PROFIEL = {
    "naam": "Julia van Loon",
    "leeftijd": "10 jaar",
    "groep": "Groep 6",
    "school": "Spinaker",
    "tiq": 142,
    "sterke_punten": [
        "Uitzonderlijk verbaal redeneervermogen",
        "Legt snel verbanden in complexe leerstof",
        "Sterk in tekstanalyse en argumentatie",
        "Empathisch en reflectief",
    ],
    "aandachtspunten": [
        "Perfectionisme en faalangst",
        "Opstarten van taken kost moeite",
        "Vermijdingsgedrag bij herhaling",
    ],
    "uitstroom": "VWO / Gymnasium",
    "raw": """
Naam: Julia van Loon
Geboortedatum: 17-02-2015 | Leeftijd: 10 jaar | Groep 6 | School: Spinaker

Cognitief profiel (WISC-V):
  TIQ: 142 | Verbaal Begrip: 148 | Visueel Ruimtelijk: 129
  Fluïde Redeneren: 136 | Werkgeheugen: 122 | Verwerkingssnelheid: 103

Didactisch niveau (juni 2025):
  Rekenen: I+ / DLE 62 (groep 8+)
  Begrijpend lezen: I+ / DLE 60 (groep 8+)
  Technisch lezen: AVI Plus | Spelling: I / DLE 53

Sterke punten:
  - Uitzonderlijk verbaal redeneervermogen en rijke woordenschat
  - Legt snel verbanden in complexe leerstof
  - Werkt langdurig geconcentreerd bij uitdagende opdrachten
  - Empathisch, reflectief en genuanceerd

Aandachtspunten:
  - Perfectionisme en faalangst
  - Opstarten en plannen van taken kost moeite bij lage motivatie
  - Vermijdingsgedrag bij herhaling en automatisering

Onderwijsbehoefte:
  - Compact aanbod met verrijking en open opdrachten
  - Onderzoekend leren met autonomie binnen kaders
  - Expliciete begeleiding bij executieve functies

Uitstroomverwachting: VWO / Gymnasium
Diagnose: Geen classificatie (DSM-V)
"""
}

LEERLING_PSEUDONIEM = "Leerling-4108"


def pseudonimiseer_tekst(tekst):
  if not tekst:
    return tekst

  geschoond = tekst

  # Vaste vervanging voor bekende leerlingnaam in dit profiel.
  echte_naam = LEERLING_PROFIEL.get("naam")
  if echte_naam:
    geschoond = geschoond.replace(echte_naam, LEERLING_PSEUDONIEM)

  # Algemene patronen voor direct herleidbare persoonsgegevens.
  geschoond = re.sub(r"\b\d{2}-\d{2}-\d{4}\b", "[DATUM]", geschoond)
  geschoond = re.sub(r"\b\d{4}\s?[A-Z]{2}\b", "[POSTCODE]", geschoond, flags=re.IGNORECASE)
  geschoond = re.sub(r"(?:\+31|0)\d[\d\-\s]{7,}\b", "[TELEFOON]", geschoond)
  geschoond = re.sub(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", "[EMAIL]", geschoond)

  return geschoond

SYSTEM_INSTRUCTION = (
    "Je bent Juf Aimee, een gespecialiseerde AI-onderwijsassistent voor hoogbegaafde kinderen (8-12 jaar). "
    "Je stijl is intellectueel uitdagend, empathisch en wetenschappelijk accuraat. "
    "Spreek de leerling aan als een jonge wetenschapper. Gebruik rijke taal en vermijd betutteling."
)

app = Flask(__name__)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Juf Aimee — AI Onderwijsassistent</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #f0f4ff;
      color: #1e1e2e;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* ── Header ── */
    header {
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: white;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.18);
    }
    header .avatar {
      width: 46px; height: 46px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px;
    }
    header h1 { font-size: 1.3rem; font-weight: 700; }
    header p  { font-size: 0.8rem; opacity: 0.85; margin-top: 2px; }

    /* ── Layout ── */
    .main {
      display: flex;
      flex: 1;
      overflow: hidden;
      gap: 0;
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 280px;
      min-width: 220px;
      background: white;
      border-right: 1px solid #e2e8f0;
      padding: 20px 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .profile-card {
      background: linear-gradient(135deg, #ede9fe, #dbeafe);
      border-radius: 14px;
      padding: 16px;
      text-align: center;
    }
    .profile-card .initials {
      width: 56px; height: 56px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: white;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; font-weight: 700;
      margin: 0 auto 10px;
    }
    .profile-card h2 { font-size: 1rem; font-weight: 700; color: #1e1b4b; }
    .profile-card .meta { font-size: 0.78rem; color: #6366f1; margin-top: 4px; }

    .iq-badge {
      background: #4f46e5;
      color: white;
      border-radius: 20px;
      padding: 4px 14px;
      font-size: 0.8rem;
      font-weight: 600;
      display: inline-block;
      margin-top: 8px;
    }

    .sidebar-section h3 {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #94a3b8;
      margin-bottom: 8px;
    }
    .tag-list { display: flex; flex-wrap: wrap; gap: 6px; }
    .tag {
      font-size: 0.73rem;
      padding: 3px 10px;
      border-radius: 20px;
      font-weight: 500;
    }
    .tag.green  { background: #dcfce7; color: #166534; }
    .tag.orange { background: #ffedd5; color: #9a3412; }
    .tag.blue   { background: #dbeafe; color: #1e40af; }

    .uitstroom {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 0.8rem;
      color: #166534;
    }
    .uitstroom strong { display: block; margin-bottom: 2px; }

    /* ── Chat area ── */
    .chat-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    #messages {
      flex: 1;
      overflow-y: auto;
      padding: 24px 28px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .message { display: flex; gap: 12px; max-width: 78%; }
    .message.user  { align-self: flex-end;  flex-direction: row-reverse; }
    .message.aimee { align-self: flex-start; }

    .msg-avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .message.aimee .msg-avatar { background: linear-gradient(135deg,#4f46e5,#7c3aed); color:white; }
    .message.user  .msg-avatar { background: linear-gradient(135deg,#0ea5e9,#38bdf8); color:white; font-size:0.8rem; font-weight:700; }

    .msg-bubble {
      padding: 12px 16px;
      border-radius: 18px;
      line-height: 1.6;
      font-size: 0.92rem;
    }
    .message.aimee .msg-bubble {
      background: white;
      border: 1px solid #e2e8f0;
      border-top-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .message.user .msg-bubble {
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: white;
      border-top-right-radius: 4px;
    }

    .typing-indicator { display:flex; gap:5px; padding: 8px 4px; align-items:center; }
    .typing-indicator span {
      width: 8px; height: 8px;
      background: #a5b4fc;
      border-radius: 50%;
      animation: bounce 1.2s infinite;
    }
    .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
    .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
      0%,60%,100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }

    /* ── Input bar ── */
    .input-bar {
      border-top: 1px solid #e2e8f0;
      background: white;
      padding: 14px 20px;
      display: flex;
      gap: 10px;
      align-items: flex-end;
    }
    #user-input {
      flex: 1;
      border: 1.5px solid #e2e8f0;
      border-radius: 14px;
      padding: 10px 16px;
      font-size: 0.92rem;
      font-family: inherit;
      resize: none;
      outline: none;
      max-height: 120px;
      line-height: 1.5;
      transition: border-color 0.2s;
    }
    #user-input:focus { border-color: #6366f1; }
    #send-btn {
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 10px 20px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.1s;
      height: 42px;
    }
    #send-btn:hover   { opacity: 0.9; }
    #send-btn:active  { transform: scale(0.97); }
    #send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* scrollbar */
    #messages::-webkit-scrollbar { width: 5px; }
    #messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

    .welcome-msg {
      text-align: center;
      color: #94a3b8;
      font-size: 0.85rem;
      margin: auto;
    }
    .welcome-msg .big { font-size: 2.5rem; margin-bottom: 8px; }
    .welcome-msg h2 { color: #4f46e5; font-size: 1.1rem; }
  </style>
</head>
<body>

<header>
  <div class="avatar">🎓</div>
  <div>
    <h1>Juf Aimee</h1>
    <p>AI-onderwijsassistent · {{ model }}</p>
  </div>
</header>

<div class="main">
  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="profile-card">
      <div class="initials">JvL</div>
      <h2>{{ profiel.naam }}</h2>
      <div class="meta">{{ profiel.leeftijd }} · {{ profiel.groep }}</div>
      <div class="meta">{{ profiel.school }}</div>
      <div class="iq-badge">TIQ {{ profiel.tiq }}</div>
    </div>

    <div class="sidebar-section">
      <h3>Sterke punten</h3>
      <div class="tag-list">
        {% for s in profiel.sterke_punten %}
        <span class="tag green">{{ s }}</span>
        {% endfor %}
      </div>
    </div>

    <div class="sidebar-section">
      <h3>Aandachtspunten</h3>
      <div class="tag-list">
        {% for a in profiel.aandachtspunten %}
        <span class="tag orange">{{ a }}</span>
        {% endfor %}
      </div>
    </div>

    <div class="uitstroom">
      <strong>Uitstroomverwachting</strong>
      {{ profiel.uitstroom }}
    </div>
  </aside>

  <!-- Chat -->
  <div class="chat-container">
    <div id="messages">
      <div class="welcome-msg">
        <div class="big">👩‍🏫</div>
        <h2>Hoi Julia! Ik ben Juf Aimee.</h2>
        <p>Stel me een vraag — ik help je als een jonge wetenschapper denken.</p>
      </div>
    </div>

    <div class="input-bar">
      <textarea id="user-input" rows="1" placeholder="Typ je vraag hier..."></textarea>
      <button id="send-btn" onclick="sendMessage()">Verstuur</button>
    </div>
  </div>
</div>

<script>
  const textarea = document.getElementById('user-input');
  textarea.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  });

  function addMessage(role, text) {
    const container = document.getElementById('messages');
    const welcome = container.querySelector('.welcome-msg');
    if (welcome) welcome.remove();

    const div = document.createElement('div');
    div.className = 'message ' + role;

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = role === 'aimee' ? '🎓' : 'JvL';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.style.whiteSpace = 'pre-wrap';
    bubble.textContent = text;

    div.appendChild(avatar);
    div.appendChild(bubble);
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return bubble;
  }

  function showTyping() {
    const container = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = 'message aimee';
    div.id = 'typing';

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = '🎓';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';

    div.appendChild(avatar);
    div.appendChild(bubble);
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById('typing');
    if (t) t.remove();
  }

  async function sendMessage() {
    const input = document.getElementById('user-input');
    const btn   = document.getElementById('send-btn');
    const text  = input.value.trim();
    if (!text) return;

    addMessage('user', text);
    input.value = '';
    input.style.height = 'auto';
    btn.disabled = true;
    showTyping();

    try {
      const res  = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vraag: text })
      });
      const data = await res.json();
      removeTyping();
      addMessage('aimee', data.antwoord);
    } catch (err) {
      removeTyping();
      addMessage('aimee', 'Er is een fout opgetreden. Controleer of de server draait en de HF_TOKEN geldig is.');
    } finally {
      btn.disabled = false;
      input.focus();
    }
  }
</script>
</body>
</html>
"""


@app.route("/")
def index():
    return render_template_string(HTML_TEMPLATE, profiel=LEERLING_PROFIEL, model=MODEL_ID)


@app.route("/chat", methods=["POST"])
def chat():
  data = request.get_json(force=True)
  gebruikers_vraag = (data.get("vraag") or "").strip()
  if not gebruikers_vraag:
    return jsonify({"antwoord": "Ik heb geen vraag ontvangen."}), 400

  veilige_profielcontext = pseudonimiseer_tekst(LEERLING_PROFIEL["raw"])
  veilige_gebruikers_vraag = pseudonimiseer_tekst(gebruikers_vraag)

  volledige_prompt = (
    f"GEGEVENS LEERLING UIT DATABASE (GEPSEUDONIMISEERD):\n{veilige_profielcontext}\n\n"
    f"VRAAG VAN DE LEERLING:\n{veilige_gebruikers_vraag}"
  )
  messages = [
    {"role": "system", "content": SYSTEM_INSTRUCTION},
    {"role": "user", "content": volledige_prompt},
  ]

  try:
    response = client.chat_completion(messages, max_tokens=800, temperature=0.7)
    antwoord = response.choices[0].message.content
  except Exception as primary_error:
    print(f"[WAARSCHUWING] Hoofdmodel ({MODEL_ID}) niet bereikbaar: {primary_error}")
    print(f"[INFO] Schakel over naar fallback: {FALLBACK_MODEL_ID}")
    try:
      response = fallback_client.chat_completion(messages, max_tokens=800, temperature=0.7)
      antwoord = response.choices[0].message.content
    except Exception as fallback_error:
      antwoord = (
        f"Beide modellen zijn momenteel niet bereikbaar.\n"
        f"Hoofd ({MODEL_ID}): {primary_error}\n"
        f"Fallback ({FALLBACK_MODEL_ID}): {fallback_error}"
      )

  return jsonify({"antwoord": antwoord})


if __name__ == "__main__":
    print("=" * 55)
    print("  Juf Aimee draait op: http://localhost:5000")
    print("=" * 55)
    app.run(debug=False, port=5000)
