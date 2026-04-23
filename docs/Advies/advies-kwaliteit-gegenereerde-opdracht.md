# Advies: Kwaliteitsborging van gegenereerde opdrachten voor hoogbegaafde leerlingen
**Leeruitkomst**: Advies

---

## Inleiding

De applicatie Juf Aimee genereert automatisch gepersonaliseerde verrijkingsopdrachten voor hoogbegaafde leerlingen op basis van hun OPP-profiel. Het generatieproces verloopt volledig via een groot taalmodel (qwen3:32b) dat opdrachten produceert op basis van een vaste prompt en opgehaalde profielinformatie. Hoewel dit tijdbesparend is voor leerkrachten, brengt het een fundamenteel risico met zich mee: er bestaat geen objectief mechanisme dat controleert of de gegenereerde opdracht daadwerkelijk voldoet aan de behoeften van de leerling.

Dit advies beschrijft de risico's van het huidige systeem en onderbouwt waarom de inzet van een **LLM-as-a-judge** — een taalmodel dat speciaal getraind is op het beoordelen van andere modellen — de meest effectieve, schaalbare en kostenefficiënte oplossing is om kwaliteitsborging te realiseren.

---

## Probleemanalyse: waar gaat het nu mis?

### 1. Hallucinatie: het model verzint feiten over de leerling

Grote taalmodellen zoals qwen3:32b zijn vatbaar voor **hallucinatie**: het genereren van plausibel klinkende informatie die feitelijk niet klopt. In de context van opdrachten voor hoogbegaafde leerlingen betekent dit dat het model interesses, eigenschappen of vaardigheden aan een leerling kan toeschrijven die nergens in het OPP-profiel staan. Een opdracht die verwijst naar een "passie voor muziek" terwijl de leerling dat nooit heeft aangegeven, ondermijnt het vertrouwen in het systeem en is potentieel schadelijk voor de leerling.

Dit is geen theoretisch risico — het is een structureel kenmerk van hoe taalmodellen werken. Zonder verificatielaag is er geen garantie dat de gepersonaliseerde elementen in een opdracht ook werkelijk gebaseerd zijn op de leerling.

### 2. Blind vertrouwen op een enkele prompt

De kwaliteit van elke gegenereerde opdracht staat of valt met de instructieprompt die aan het model wordt meegegeven. Deze prompt bevat instructies als *"gebruik ALLEEN interesses die je via search_opp hebt gevonden"* en *"de opdracht past bij Bloom-niveau"*. Het model kan deze instructies echter negeren, verkeerd interpreteren of inconsistent toepassen — zonder dat dit op enige manier gedetecteerd wordt.

Er is op dit moment geen enkel mechanisme dat controleert of het model de instructies daadwerkelijk heeft opgevolgd. De opdracht wordt gegenereerd en direct aangeboden aan de leerkracht, zonder tussenliggende kwaliteitscheck.

### 3. Geen gedefinieerde norm voor een "goede" opdracht

Er bestaat nergens een formele definitie van wat een kwalitatief goede verrijkingsopdracht voor een hoogbegaafde leerling inhoudt. Vragen zoals *"is deze opdracht uitdagend genoeg?"*, *"sluit dit aan bij het cognitieve niveau van dit kind?"* of *"wordt de leerling hier intrinsiek gemotiveerd door?"* worden impliciet overgelaten aan het oordeel van het generatiemodel zelf.

Zonder een expliciete rubric met meetbare criteria is kwaliteitsborging niet mogelijk — niet door mensen en niet door machines.

### 4. Onzekerheid over gebruik van het OPP-profiel

Het systeem gebruikt een vectorzoekfunctie (`search_opp`) om relevante informatie uit het OPP-profiel op te halen. Vervolgens roept het generatiemodel deze tool aan in een eerste API-aanroep, waarna het de opgehaalde informatie verwerkt in de opdracht.

Er is echter geen garantie dat de juiste informatie wordt opgehaald, noch dat het model deze informatie ook daadwerkelijk verwerkt in de opdracht. Het model kan tool-calls overslaan, irrelevante fragmenten ophalen of de gevonden interesses negeren ten gunste van generieke opdrachten. Dit is onzichtbaar voor de leerkracht die de opdracht ontvangt.

---

## Aanbeveling: inzet van een LLM-as-a-judge

In plaats van menselijke beoordeling van elke gegenereerde opdracht, adviseer ik de inzet van een **LLM-as-a-judge**: een taalmodel dat uitsluitend getraind is op het evalueren van de uitvoer van andere taalmodellen aan de hand van een gestructureerde rubric.

### Hoe werkt een LLM-judge?

Een LLM-judge ontvangt drie inputs:

1. **De studentcontext** — relevante informatie uit het OPP-profiel (interesses, Bloom-niveau, beginsituatie, leeftijd)
2. **De gegenereerde opdracht** — de output van het generatiemodel
3. **Een rubric** — een set van gedefinieerde criteria met scorebeschrijvingen per niveau (1–5)

Per criterium genereert de judge een schriftelijke onderbouwing en een score. Op basis van de totaalscore wordt automatisch een beslissing genomen: de opdracht wordt **goedgekeurd**, **geflagd voor leerkrachtcontrole**, of **opnieuw gegenereerd**.

Het model dat hiervoor ingezet wordt is **Prometheus 2** (`vicgalle/prometheus-7b-v2.0`), een open-source taalmodel dat specifiek getraind is voor het beoordelen van andere taalmodellen. Prometheus 2 is ontworpen om beoordelingen te geven die sterk correleren met menselijke oordelen, maar dan volledig geautomatiseerd en reproduceerbaar.

### Welke criteria worden beoordeeld?

De judge evalueert elke gegenereerde opdracht op acht criteria:

| # | Criterium |
|---|-----------|
| 1 | Sluit de opdracht aan bij de gedocumenteerde interesses van de leerling? |
| 2 | Komt het moeilijkheidsniveau overeen met het opgegeven Bloom-niveau? |
| 3 | Kan de leerling de opdracht zelfstandig uitvoeren? |
| 4 | Sluit de opdracht aan bij de beginsituatie uit het OPP? |
| 5 | Is de opdracht leeftijdspassend in taal, toon en inhoud? |
| 6 | Kan de leerkracht de opdracht gemakkelijk lezen, beoordelen en aanpassen? |
| 7 | Zijn alle persoonlijke elementen herleidbaar tot het OPP (geen hallucinaties)? |
| 8 | Gebruikt de opdracht alleen relevante leerlinginformatie? |

Deze criteria vormen samen een operationele definitie van een kwalitatief goede opdracht voor hoogbegaafde leerlingen — iets wat nu volledig ontbreekt in het systeem.

### Waarom een LLM-judge en geen menselijke beoordeling?

De keuze voor een LLM-judge is niet alleen pragmatisch, maar ook onderbouwd door recent onderzoek. Saha et al. (2026) beschrijven een praktisch scenario waarin een team 10.000 prompt-response paren moet beoordelen. Menselijke beoordeling kost in dit scenario $5 per beoordeling, wat neerkomt op $50.000 in totaal. Een LLM-judge doet hetzelfde voor $0.01 of minder per beoordeling — een kostenbesparing van meer dan 99%.

Hoewel dit een grootschalig scenario betreft, geldt dezelfde logica voor Juf Aimee: elke gegenereerde opdracht beoordelen via een menselijke expert is duur, traag en onschaalbaar. Een geautomatiseerde judge maakt continue kwaliteitscontrole mogelijk zonder extra personeel of vertraging.

Bovendien is een LLM-judge **consistent**: waar menselijke beoordelaars variëren in interpretatie en aandacht, past de judge dezelfde rubric altijd op dezelfde manier toe. Dit maakt de beoordelingen vergelijkbaar over tijd en over leerlingen heen.

---

## Maatschappelijke impact

De inzet van een LLM-judge heeft impact die verder gaat dan technische kwaliteitsborging.

**Voor de leerling**: Hoogbegaafde kinderen hebben specifieke onderwijsbehoeften die in regulier onderwijs vaak onvoldoende worden ingevuld. Een opdracht die niet aansluit bij hun interesses of cognitief niveau kan leiden tot onderstimulering, frustratie of zelfs afkeer van school. Een geautomatiseerde kwaliteitscheck beschermt de leerling tegen opdrachten die weliswaar gegenereerd zijn, maar niet daadwerkelijk passen.

**Voor de leerkracht**: Leerkrachten die werken met hoogbegaafde leerlingen hebben vaak onvoldoende tijd en expertise om elke gegenereerde opdracht grondig te beoordelen. Door de beoordeling gedeeltelijk te automatiseren, wordt de leerkracht ontlast en ondersteund — niet vervangen. De leerkracht blijft eindverantwoordelijk, maar krijgt een gerichte signalering bij twijfelgevallen.

**Voor het onderwijs breed**: Als AI-gegenereerde opdrachten zonder kwaliteitsborging de klas ingaan, bestaat het risico dat het vertrouwen in AI-ondersteund onderwijs afneemt — bij leerkrachten, ouders en leerlingen. Een transparant, reproduceerbaar beoordelingssysteem vergroot het draagvlak voor verantwoorde inzet van AI in het onderwijs.

**Beperking en verantwoordelijkheid**: Het gebruik van een LLM-judge elimineert hallucinatie niet volledig — ook de judge kan fouten maken. Escalatie naar menselijke beoordeling blijft noodzakelijk bij herhaalde lage scores. De judge is een ondersteunend instrument, geen vervanging voor professioneel pedagogisch oordeel.

---

## Conclusie

Het huidige systeem genereert opdrachten op basis van een enkele prompt en levert de output direct aan de leerkracht, zonder enige tussenliggende kwaliteitscheck. Dit brengt risico's met zich mee op het gebied van hallucinatie, onjuiste personalisatie en inconsistentie.

De aanbeveling is om een LLM-as-a-judge te integreren in het generatieproces, op basis van een expliciete rubric met acht criteria. Het open-source model Prometheus 2 is hiervoor geschikt omdat het specifiek getraind is op deze taak, lokaal draait via Ollama en geen extra kosten met zich meebrengt.

De maatschappelijke meerwaarde is duidelijk: betere opdrachten voor kwetsbare leerlingen, minder werkdruk voor leerkrachten en een verantwoorde inzet van AI die ook op lange termijn vertrouwen verdient.

---

## Bronnen

- Saha, S., et al. (2026). *LLM-as-a-Judge: Automated Evaluation of Language Model Outputs*. Geciteerd in de context van kostenberekening voor grootschalige beoordeling.
- Kim, S., et al. (2024). *Prometheus 2: An Open Source Language Model Specialized in Evaluating Other Language Models*. Beschikbaar via Ollama als `vicgalle/prometheus-7b-v2.0`.
