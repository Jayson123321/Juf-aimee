# Kwaliteitsborging van gegenereerde opdrachten voor hoogbegaafde leerlingen
**Leeruitkomst**: Advies

---

## Inleiding

De applicatie Juf Aimee genereert automatisch gepersonaliseerde verrijkingsopdrachten voor hoogbegaafde leerlingen op basis van hun OPP-profiel. Het generatieproces verloopt volledig via een groot taalmodel dat opdrachten produceert op basis van een vaste prompt en opgehaalde profielinformatie. Hoewel dit tijdbesparend is voor leerkrachten, brengt het een fundamenteel risico met zich mee: er bestaat geen objectief mechanisme dat controleert of de gegenereerde opdracht daadwerkelijk voldoet aan de behoeften van de leerling. Op basis van deze problematiek is de volgende hoofdvraag opgesteld:

*Juf Aimee genereert een opdracht voor een hoogbegaafde leerling, maar hoe weet je of die opdracht goed genoeg is om aan het kind te geven en hoe weet je of het RAG-systeem de juiste informatie uit het OPP heeft gebruikt?*

Om deze hoofdvraag te beantwoorden zijn de volgende deelvragen geformuleerd:

1. Welke risico's kleven aan het huidige generatieproces zonder kwaliteitscontrole?
2. Hoe kan gecontroleerd worden of een gegenereerde opdracht voldoet aan de verwachte kwaliteitseisen?
3. Welke criteria bepalen of een gegenereerde opdracht geschikt is voor een hoogbegaafde leerling?
4. Wat is de maatschappelijke meerwaarde van geautomatiseerde kwaliteitsborging in dit systeem?

### Modelselectie voor het generatiemodel

In een eerdere onderzoeksfase zijn vijf taalmodellen geëvalueerd via HuggingChat (zie [Modelkeuze.md](../Analyseren/Modelkeuze.md)). Op basis van dat onderzoek is gekozen voor een lokaal gehoste aanpak via Ollama, zodat privacygevoelige OPP-data het systeem niet verlaat. Tijdens de implementatie zijn vervolgens meerdere modellen getest op de daadwerkelijke generatietaak:

| Model | Bevinding |
|---|---|
| `qwen2.5:7b` | Startpunt. Genereerde platte alineatekst zonder structuur; negeerde tijdsconstraints consequent. |
| `gpt-oss:20b-cloud` | Iets beter, maar vereiste zeer veel prompt engineering voor elke randconditie (stappenstructuur, tijdsduur, stuurvragen). |
| `qwen3:30b` / `qwen3:32b` | Getest via een Research Cloud server (19–20 GB modelgewicht). Kwaliteit was veelbelovend, maar het model was te zwaar voor de beschikbare VRAM en kon niet stabiel draaien. Opdracht generatie duurde daardoor > 2 minuten |
| `qwen3.5:397b-cloud` | Sterkste model; vereist een betaalde Ollama-subscription, niet beschikbaar voor dit project. |
| `gemma4:31b-cloud` | Gratis beschikbaar via Ollama Cloud. Genereert consistent gestructureerde opdrachten met genummerde stappen, stuurvragen en een concreet eindproduct. Respecteert tijdsconstraints en verwijst correct naar OPP-bronnen in de onderbouwing. Geselecteerd als generatiemodel. |

De keuze voor `gemma4:31b-cloud` is gebaseerd op de combinatie van kwaliteit, beschikbaarheid en kostenneutraliteit. Vergeleken met kleinere modellen begrijpt Gemma 4 pedagogische constraints zoals tijdsduur en Bloom-niveau zonder dat elke randconditie expliciet in de prompt afgedwongen moet worden.

Dit advies beschrijft de risico's van het huidige systeem en onderbouwt waarom de inzet van een **LLM-as-a-judge** (een taalmodel dat speciaal getraind is op het beoordelen van andere modellen) de meest effectieve, schaalbare en kostenefficiënte oplossing is om kwaliteitsborging te realiseren.

---

## Probleemanalyse: waar gaat het nu mis?

*Deelvraag 1: Welke risico's kleven aan het huidige generatieproces zonder kwaliteitscontrole?*

### 1. Hallucinatie: het model verzint feiten over de leerling

Grote taalmodellen zoals qwen3:32b zijn vatbaar voor **hallucinatie**: het genereren van plausibel klinkende informatie die feitelijk niet klopt. In de context van opdrachten voor hoogbegaafde leerlingen betekent dit dat het model interesses, eigenschappen of vaardigheden aan een leerling kan toeschrijven die nergens in het OPP-profiel staan. Een opdracht die verwijst naar een "passie voor muziek" terwijl de leerling dat nooit heeft aangegeven, ondermijnt het vertrouwen in het systeem en is potentieel schadelijk voor de leerling.

Dit is geen theoretisch risico, maar een structureel kenmerk van hoe taalmodellen werken (Huang et al., 2023). Zonder verificatielaag is er geen garantie dat de gepersonaliseerde elementen in een opdracht ook werkelijk gebaseerd zijn op de leerling.

### 2. Blind vertrouwen op een enkele prompt

De kwaliteit van elke gegenereerde opdracht staat of valt met de instructieprompt die aan het model wordt meegegeven. Deze prompt bevat instructies als *"gebruik ALLEEN interesses die je via search_opp hebt gevonden"* en *"de opdracht past bij Bloom-niveau"*. Het model kan deze instructies echter negeren, verkeerd interpreteren of inconsistent toepassen, zonder dat dit op enige manier gedetecteerd wordt.

Er is op dit moment geen enkel mechanisme dat controleert of het model de instructies daadwerkelijk heeft opgevolgd. De opdracht wordt gegenereerd en direct aangeboden aan de leerkracht, zonder tussenliggende kwaliteitscheck.

### 3. Geen gedefinieerde norm voor een "goede" opdracht

Er bestaat nergens een formele definitie van wat een kwalitatief goede verrijkingsopdracht voor een hoogbegaafde leerling inhoudt. Vragen zoals *"is deze opdracht uitdagend genoeg?"*, *"sluit dit aan bij het cognitieve niveau van dit kind?"* of *"wordt de leerling hier intrinsiek gemotiveerd door?"* worden impliciet overgelaten aan het oordeel van het generatiemodel zelf.

Zonder een expliciete rubric met meetbare criteria is kwaliteitsborging niet mogelijk, niet door mensen en niet door machines.

### 4. Onzekerheid over gebruik van het OPP-profiel

Het systeem gebruikt een vectorzoekfunctie (`search_opp`) om relevante informatie uit het OPP-profiel op te halen. Vervolgens roept het generatiemodel deze tool aan in een eerste API-aanroep, waarna het de opgehaalde informatie verwerkt in de opdracht.

Er is echter geen garantie dat de juiste informatie wordt opgehaald, noch dat het model deze informatie ook daadwerkelijk verwerkt in de opdracht. Het model kan tool-calls overslaan, irrelevante fragmenten ophalen of de gevonden interesses negeren ten gunste van generieke opdrachten. Dit is onzichtbaar voor de leerkracht die de opdracht ontvangt.

---

## Afweging van oplossingen

*Deelvraag 2: Hoe kan gecontroleerd worden of een gegenereerde opdracht voldoet aan de verwachte kwaliteitseisen?*

Voordat tot een aanbeveling wordt gekomen, is het belangrijk om kort te kijken naar welke vormen van kwaliteitsborging in deze context realistisch zijn. In de literatuur over evaluatie van taalmodellen worden grofweg drie benaderingen onderscheiden: menselijke beoordeling, self-evaluation door het generatiemodel zelf, en de inzet van een afzonderlijke LLM-as-a-judge (Li et al., 2024; Zheng et al., 2023).

**Optie 1: Menselijke beoordeling**

De meest voor de hand liggende oplossing is dat de leerkracht of een hoogbegaafdheidsspecialist elke gegenereerde opdracht beoordeelt voordat deze aan de leerling wordt gegeven. Dit is qua kwaliteit het sterkste vangnet: een deskundige professional weegt context, toon en pedagogische passendheid op een manier die geen enkel model evenaart. Menselijke annotatie wordt dan ook vaak beschouwd als de "ground truth" bij het evalueren van AI-output (Li et al., 2024).

In de praktijk loopt deze oplossing echter vast op tijd en schaalbaarheid: het verzamelen van menselijke beoordelingen is tijdrovend en kostenintensief, waardoor het lastig opschaalt (Li et al., 2024). Juist het tijdwinst-argument is de reden dat Juf Aimee bestaat. Wanneer elke gegenereerde opdracht alsnog handmatig moet worden gecontroleerd, vervalt het voordeel van automatisering grotendeels. Daarbij komt dat leerkrachten die met hoogbegaafde leerlingen werken zich, zoals eerder genoemd, soms handelingsverlegen tonen rond uitdaging op maat (Van Gerven et al., 2025) — de inhoudelijke beoordeling vraagt dus juist expertise die niet altijd beschikbaar is.

**Optie 2: Self-evaluation door het generatiemodel**

Een tweede optie is om hetzelfde generatiemodel zijn eigen output te laten beoordelen via een tweede prompt. Dit is technisch eenvoudig en kost geen extra modelinfrastructuur.

Het probleem is dat een model dat zijn eigen output beoordeelt structureel mild is over zichzelf. Dit fenomeen staat in de literatuur bekend als **self-preference bias** of **self-enhancement bias**: een taalmodel kent systematisch hogere scores toe aan zijn eigen output dan aan output van andere modellen of mensen, terwijl menselijke beoordelaars die output als gelijkwaardig beoordelen (Panickssery et al., 2024; Zheng et al., 2023). Xu et al. (2024) tonen daarbij aan dat self-refinement deze bias zelfs versterkt: dezelfde aannames die tot een fout leidden in de generatiestap, worden in de evaluatiestap niet opnieuw bevraagd. Een gehallucineerde "passie voor muziek" wordt door het model dus niet als hallucinatie herkend, omdat het in beide stappen vanuit dezelfde interne representatie redeneert. Self-evaluation vergroot daarmee schijnzekerheid zonder echte controle toe te voegen.

**Optie 3: LLM-as-a-judge (afzonderlijk model)**

De derde optie is om de beoordeling uit te besteden aan een ander model dat specifiek voor evaluatietaken is ontworpen. Dit combineert de schaalbaarheid en consistentie van een geautomatiseerde aanpak met een onafhankelijke blik op de output van het generatiemodel. Omdat de judge vanuit een andere training en architectuur naar de opdracht kijkt, worden fouten en aannames van het generatiemodel eerder zichtbaar dan bij self-evaluation (Wolfe, 2024). Onderzoek laat zien dat een goed ingezette LLM-judge sterk kan correleren met menselijke oordelen, tegen aanzienlijk lagere kosten en hogere snelheid dan handmatige evaluatie (Li et al., 2024; Zheng et al., 2023).

**Conclusie van de afweging**

Menselijke beoordeling levert de hoogste kwaliteit, maar is niet schaalbaar. Self-evaluation is schaalbaar, maar levert door self-preference bias geen onafhankelijke controle op. Een afzonderlijke LLM-as-a-judge combineert het beste van beide: continue, geautomatiseerde controle door een ander model dan het generatiemodel, met menselijke beoordeling als escalatiepad bij twijfelgevallen. Op basis hiervan wordt de inzet van een LLM-as-a-judge aanbevolen, hieronder verder uitgewerkt.

---

## Aanbeveling: inzet van een LLM-as-a-judge

De aanbeveling is om een **LLM-as-a-judge** te integreren in het generatieproces: een taalmodel dat uitsluitend getraind is op het evalueren van de uitvoer van andere taalmodellen aan de hand van een gestructureerde rubric.

### Hoe werkt een LLM-judge?

Een LLM-judge ontvangt drie inputs:

1. **De studentcontext**: relevante informatie uit het OPP-profiel (interesses, Bloom-niveau, beginsituatie, leeftijd)
2. **De gegenereerde opdracht**: de output van het generatiemodel
3. **Een rubric**: een set van gedefinieerde criteria met scorebeschrijvingen per niveau (1-5)

Per criterium genereert de judge een schriftelijke onderbouwing en een score. Op basis van de totaalscore wordt automatisch een beslissing genomen: de opdracht wordt **goedgekeurd**, **geflagd voor leerkrachtcontrole**, of **opnieuw gegenereerd**.

Het model dat hiervoor ingezet wordt is **Prometheus 2** (`tensortemplar/prometheus2:7b-fp16`), een open-source taalmodel dat specifiek getraind is voor het beoordelen van andere taalmodellen. Prometheus 2 is ontworpen om beoordelingen te geven die sterk correleren met menselijke oordelen, maar dan volledig geautomatiseerd en reproduceerbaar (Kim et al., 2024).

### Welke criteria worden beoordeeld?

*Deelvraag 3: Welke criteria bepalen of een gegenereerde opdracht geschikt is voor een hoogbegaafde leerling?*

De judge evalueert elke gegenereerde opdracht op zeven criteria:

| # | Criterium |
|---|-----------|
| 1 | Zijn alle elementen in de opdracht aantoonbaar gebaseerd op het leerlingprofiel, zonder verzonnen informatie? (RAGAS, Faithfulness) |
| 2 | Gebruikt de opdracht alleen relevante leerlinginformatie en laat het irrelevante details weg? (RAGAS, Context Precision) |
| 3 | Weerspiegelt de opdracht alle relevante leerlingkenmerken uit het profiel, inclusief zowel sterke punten als gedocumenteerde uitdagingen? (RAGAS, Context Recall) |
| 4 | Sluit de opdracht aan bij de gedocumenteerde interesses van de leerling? (Hoogbegaafdheidsonderwijs) |
| 5 | Komt het cognitieve niveau van de opdracht overeen met het opgegeven Bloom-niveau? (Hoogbegaafdheidsonderwijs) |
| 6 | Kan de leerling de opdracht zelfstandig uitvoeren, gegeven zijn leeftijd en niveau? (Hoogbegaafdheidsonderwijs) |
| 7 | Is de opdracht leeftijdspassend in taal, toon en inhoud? (Hoogbegaafdheidsonderwijs) |

Deze criteria vormen samen een operationele definitie van een kwalitatief goede opdracht voor hoogbegaafde leerlingen, iets wat nu volledig ontbreekt in het systeem.

### Kostenvergelijking

De keuze voor een LLM-judge is ook financieel onderbouwd. Saha et al. (2026) beschrijven een scenario waarin een team 10.000 prompt-response paren beoordeelt. Menselijke beoordeling kost in dat scenario $5 per beoordeling — $50.000 in totaal. Een LLM-judge doet hetzelfde voor $0.01 of minder per beoordeling, een kostenbesparing van meer dan 99%.

Voor Juf Aimee geldt dezelfde logica op kleinere schaal: continue kwaliteitscontrole via een menselijke expert is duur en onschaalbaar. De LLM-judge maakt automatische beoordeling mogelijk zonder extra personeel of vertraging, en past de rubric altijd op dezelfde manier toe — ongeacht hoe vaak het systeem gebruikt wordt.

---

## Maatschappelijke impact

*Deelvraag 4: Wat is de maatschappelijke meerwaarde van geautomatiseerde kwaliteitsborging in dit systeem?*

De inzet van een LLM-judge heeft impact die verder gaat dan technische kwaliteitsborging. Om die impact te begrijpen, is het belangrijk om eerst te kijken naar wat er op het spel staat wanneer hoogbegaafde leerlingen geen passend onderwijsaanbod krijgen.

**Voor de leerling**: Onderstimulering van hoogbegaafde leerlingen kan leiden tot verveling, verminderde motivatie en in extreme gevallen schooluitval (Van Gerven et al., 2025). Een opdracht die niet aansluit bij de interesses of het cognitieve niveau van een leerling draagt hier direct aan bij, ook al lijkt deze op het eerste gezicht "verrijkend". Een geautomatiseerde kwaliteitscheck beschermt de leerling tegen opdrachten die in de praktijk geen recht doen aan wat dit specifieke kind nodig heeft.

**Voor de leerkracht**: Leerkrachten ervaren al een hoge werkdruk door de niveauverschillen in de klas, en tonen zich soms handelingsverlegen rond uitdaging op maat (Van Gerven et al., 2025). Door de eerste kwaliteitsbeoordeling te automatiseren, wordt de leerkracht ondersteund, niet vervangen: de leerkracht blijft eindverantwoordelijk, maar krijgt een gerichte signalering bij twijfelgevallen.

**Voor het onderwijs breed**: Als AI-gegenereerde opdrachten zonder kwaliteitsborging de klas ingaan, bestaat het risico dat het vertrouwen in AI-ondersteund onderwijs afneemt, bij leerkrachten, ouders en leerlingen. Dit raakt aan een breder thema dat het basisboek benoemt: passend onderwijs voor hoogbegaafde leerlingen vraagt om schoolbreed beleid waarbij signalering, professionalisering en samenwerking centraal staan (Van Gerven et al., 2025). Een transparant, reproduceerbaar beoordelingssysteem past binnen die bredere kwaliteitscultuur en vergroot het draagvlak voor verantwoorde inzet van AI in het onderwijs.

**Beperking en verantwoordelijkheid**: Het gebruik van een LLM-judge elimineert hallucinatie niet volledig; ook de judge kan fouten maken. Escalatie naar menselijke beoordeling blijft noodzakelijk bij herhaalde lage scores. De judge is een ondersteunend instrument, geen vervanging voor professioneel pedagogisch oordeel.

---

## Conclusie

Het huidige systeem genereert opdrachten op basis van een enkele prompt en levert de output direct aan de leerkracht, zonder enige tussenliggende kwaliteitscheck. Dit brengt risico's met zich mee op het gebied van hallucinatie, onjuiste personalisatie en inconsistentie.

De aanbeveling is om een LLM-as-a-judge te integreren in het generatieproces, op basis van een expliciete rubric met zeven criteria. Het open-source model Prometheus 2 is hiervoor geschikt omdat het specifiek getraind is op deze taak, lokaal draait via Ollama en geen extra kosten met zich meebrengt.

De maatschappelijke meerwaarde is duidelijk: betere opdrachten voor kwetsbare leerlingen, minder werkdruk voor leerkrachten en een verantwoorde inzet van AI die ook op lange termijn vertrouwen verdient.

---

## Bronnen

- Huang, L., Yu, W., Ma, W., Zhong, W., Feng, Z., Wang, H., Chen, Q., Peng, W., Feng, X., Qin, B., & Liu, T. (2023). *A Survey on Hallucination in Large Language Models: Principles, Taxonomy, Challenges, and Open Questions*. arXiv:2311.05232. https://arxiv.org/abs/2311.05232

- Kim, S., Suk, J., Longpre, S., Lin, B. Y., Shin, J., Welleck, S., Neubig, G., Lee, M., Lee, H., & Seo, M. (2024). *Prometheus 2: An Open Source Language Model Specialized in Evaluating Other Language Models*. Proceedings of EMNLP 2024. https://arxiv.org/abs/2405.01535

- Tan, Y., et al. (2024). *A Survey on LLM-as-a-Judge*. arXiv:2411.15594. https://arxiv.org/abs/2411.15594

- Saha, S., et al. (2026). *LLM-as-a-Judge: Automated Evaluation of Language Model Outputs*. Geciteerd in de context van kostenberekening voor grootschalige beoordeling.

- Van Gerven, E., Zonneveld, R., Oosterveen, N., Dekkers, A., & Den Boer, Y. (Red.). (2025). Basisboek (Hoog)begaafdheid voor po en vo: Kansrijk onderwijs vanuit een inclusieve gedachte voor leerlingen met kenmerken van (hoog)begaafdheid (1e ed.). Kenniscentrum Hoogbegaafdheid.

- Li, H., Dong, Q., Chen, J., Su, H., Zhou, Y., Ai, Q., Ye, Z., & Liu, Y. (2024). *LLMs-as-Judges: A Comprehensive Survey on LLM-based Evaluation Methods*. arXiv:2412.05579. https://arxiv.org/abs/2412.05579

- Panickssery, A., Bowman, S. R., & Feng, S. (2024). *LLM Evaluators Recognize and Favor Their Own Generations*. arXiv:2404.13076. https://arxiv.org/abs/2404.13076

- Wolfe, C. R. (2024, juli 22). *Using LLMs for Evaluation*. Deep (Learning) Focus. https://cameronrwolfe.substack.com/p/llm-as-a-judge

- Xu, W., Zhu, G., Zhao, X., Pan, L., Li, L., & Wang, W. Y. (2024). *Pride and Prejudice: LLM Amplifies Self-Bias in Self-Refinement*. arXiv:2402.11436. https://arxiv.org/abs/2402.11436

- Zheng, L., Chiang, W.-L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z., Li, Z., Li, D., Xing, E. P., Zhang, H., Gonzalez, J. E., & Stoica, I. (2023). *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena*. arXiv:2306.05685. https://arxiv.org/abs/2306.05685

- https://docs.ragas.io/en/latest/concepts/metrics/available_metrics/