# Advies: de AI-oplossing van Juf Aimee borgen en doorontwikkelen

> **Leeruitkomst:** Adviseren
> **Opgesteld door:** Ruben — Studio RAAI, HvA.
> **Voor:** de opdrachtgever (Lectoraat Digital Life, HvA).
> **Perspectief:** dit advies is onderbouwd vanuit de **realisatiefase** — de inzichten komen uit wat we daadwerkelijk hebben gebouwd, getest en zien werken (en falen). Het is daarmee de praktijkgerichte tegenhanger van de adviezen die vanuit analyse en ontwerp zijn opgesteld in [Advies Juf Aimee](advies-juf-aimee.md).

---

## Aanleiding

Juf Aimee is een AI-onderwijsassistent die leraren helpt om gepersonaliseerde verrijkingsopdrachten te maken voor hoogbegaafde leerlingen, op basis van hun OPP (Ontwikkelingsperspectiefplan). Wij hebben dit als team van prototype tot een **werkende, geïntegreerde applicatie** gebracht: een lokaal gehoste AI-pipeline die opdrachten genereert, personaliseert op het volledige leerlingprofiel, en de kwaliteit ervan automatisch bewaakt.

Nu het fundament staat, is de centrale vraag voor de opdrachtgever: **welke AI-oplossing past structureel bij Juf Aimee, en hoe houden we die verantwoord en overdraagbaar?** Dit advies beantwoordt die vraag vanuit wat we tijdens het bouwen concreet hebben geleerd, en benoemt expliciet de maatschappelijke gevolgen van de keuzes.

De uitvoering ervan staat in twee aparte documenten voor het volgende ontwikkelteam: de [Technische overdracht](technisch-overdrachtsdocument.md) (hoe het in elkaar zit) en een suggestie voor de [werkwijze & vervolgwerk](backlog-volgende-team.md) (hoe het aan te pakken).

---

## Kernadvies (samenvatting)

!!! abstract "Het advies in zes regels — zonder techniek"
    1. **Houd de gekozen AI-oplossing aan: lokaal gehoste taalmodellen + een profielgestuurde generatie-pipeline (RAS) + een AI-kwaliteitscontrole (de "judge").** Deze combinatie werkt aantoonbaar in het prototype en past bij een publieke onderwijsinstelling.
    2. **Investeer de eerstvolgende periode in borgen vóór uitbreiden:** beveiliging, privacy en het opschonen van dubbele code. Pas daarna nieuwe functies.
    3. **De reden is maatschappelijk, niet alleen technisch:** het systeem verwerkt gevoelige gegevens van minderjarigen, en leraren nemen beslissingen op basis van de AI-output. Betrouwbaarheid en privacy zijn hier randvoorwaarden, geen luxe.
    4. **Voorkom afhankelijkheid van commerciële AI-clouds** — lokaal hosten houdt de regie, de data en de kosten in eigen hand.
    5. **De leraar blijft altijd de eindbeslisser.** De AI adviseert en onderbouwt; toewijzen aan een kind gebeurt nooit zonder akkoord van een mens.
    6. **Concreet eerste besluit:** keur een korte "borgingssprint" goed (beveiliging + opschoning) voordat het nieuwe team aan features begint.

---

## Hoofdadvies over de AI-oplossing

De drie kernadviezen, elk in de vorm *advies → onderbouwing (uit realisatie) → afgewogen alternatief → gevolg als je het niet doet*.

### Advies 1 — Behoud lokaal gehoste LLM's als fundament

**Advies.** Blijf de taalmodellen zelf hosten (op eigen of SURF-infrastructuur). Kies géén commerciële cloud-LLM (zoals OpenAI of Gemini) als kern van het systeem.

**Onderbouwing uit de realisatie.** We hebben de volledige pipeline werkend gekregen op lokale/SURF-GPU's met open modellen. De OPP's van leerlingen — bijzondere persoonsgegevens van minderjarigen — verlaten daarmee nooit de eigen infrastructuur. We zagen ook concreet de grenzen: op een 24GB-GPU liepen we tegen geheugenproblemen aan, die we hebben opgelost met bewust modelbeheer. Dat is een oplosbaar hardware-vraagstuk, geen reden om naar de commerciële cloud uit te wijken.

**Afgewogen alternatief.** Een commerciële cloud-LLM is krachtiger en vraagt geen eigen GPU-beheer. Maar dan stuur je leerlinggegevens naar een externe partij (privacyrisico + AVG-verwerkersovereenkomsten), ontstaat er een terugkerende kostenpost per verwerking, en raak je afhankelijk van een leverancier die voorwaarden en prijzen kan wijzigen.

**Gevolg als je dit níét doet.** De privacy van kinderen komt bij een externe partij te liggen en de instelling verliest de regie over data en kosten — precies wat een publieke onderwijsorganisatie wil vermijden.

### Advies 2 — Maak de RAS-pipeline + judge de officiële standaard

**Advies.** Kies de RAS-pipeline (profiel + portfolio + feedback + reflecties in één gestructureerde generatie) als dé manier van opdrachtgeneratie, met de AI-kwaliteitscontrole (judge) als verplichte poort. Bouw de oudere, losse varianten af.

**Onderbouwing uit de realisatie.** De RAS-aanpak levert in de praktijk persoonlijkere opdrachten dan kale tekstgeneratie, omdat hij meeneemt wat een leerling eerder déed en hoe de leraar daarop reageerde. De judge beoordeelt elke opdracht op 7 wetenschappelijk onderbouwde criteria en kan automatisch laten hergenereren — we hebben gezien dat dit zwakke opdrachten eruit filtert vóór een leraar ze ziet.

**Afgewogen alternatief.** Eén simpele generatie zonder judge is sneller en goedkoper in rekenkracht. Maar dan verdwijnt de kwaliteitsgarantie, en juist bij hoogbegaafde leerlingen is een te makkelijke of inhoudelijk onjuiste opdracht direct demotiverend.

**Gevolg als je dit níét doet.** Er blijven meerdere implementaties naast elkaar bestaan, niemand weet welke "de echte" is, en de kwaliteit van wat een leraar voorgeschoteld krijgt wordt onvoorspelbaar.

### Advies 3 — Borg eerst, breid daarna uit

**Advies.** Plan vóór nieuwe features eerst een korte borgingssprint: beveiliging (toegangscontrole op de AI-functies, een gelekte sleutel intrekken, autorisatie per gebruiker), privacy en het opschonen van dubbele code.

**Onderbouwing uit de realisatie.** Tijdens het bouwen ontdekten we concrete kwetsbaarheden in onze eigen codebase: een geheime sleutel die per ongeluk in de projectgeschiedenis terechtkwam, AI-functies zonder toegangscontrole en een mogelijke fout waardoor een leerling bij andermans gegevens zou kunnen. Dit zijn geen theoretische risico's.

**Afgewogen alternatief.** Doorgaan met features is zichtbaarder en voelt sneller. Maar techniek-schuld en beveiligingsgaten groeien mee en worden later veel duurder om te herstellen.

**Gevolg als je dit níét doet.** Een systeem dat data van kinderen verwerkt gaat onveilig de praktijk in — een reëel afbreuk- en reputatierisico voor de instelling.

---

## Maatschappelijke impact van deze keuzes

De adviezen hierboven zijn bewust niet alleen op techniek gekozen, maar op hun maatschappelijke gevolgen.

- **Privacy en bescherming van minderjarigen (AVG).** OPP's bevatten gevoelige informatie over kinderen (cognitief profiel, thuissituatie, beperkingen). Door lokaal te hosten en de beveiliging te borgen, blijft die data binnen de instelling en bij de juiste personen. Dit raakt direct aan de rechten van het kind en aan de zorgplicht van de school.
- **Betrouwbaarheid en kansengelijkheid.** Een leraar handelt naar het AI-advies. Een foute of te makkelijke opdracht raakt een individueel kind in zijn motivatie en ontwikkeling. De judge als kwaliteitspoort is daarmee een maatschappelijke keuze: hij beschermt de leerling tegen slechte AI-output.
- **De leraar in regie, niet vervangen.** Het hele ontwerp houdt de mens als eindbeslisser. Dit voorkomt dat onderwijsbeslissingen aan een algoritme worden uitbesteed — passend bij het kader *Algoritmen in het onderwijs* (College voor de Rechten van de Mens, 2024).
- **Publieke waarde en duurzaamheid.** Open, zelf-gehoste modellen voorkomen leveranciersafhankelijkheid en terugkerende kosten per leerling. Voor een publiek gefinancierde onderwijsinstelling is dat verantwoord en houdbaar op lange termijn.
- **Schaalbare ondersteuning bij het lerarentekort.** Goede differentiatie voor hoogbegaafde leerlingen is arbeidsintensief. Een betrouwbare AI-assistent maakt die zorg schaalbaar zonder de leraar te vervangen — mits de bovenstaande randvoorwaarden geborgd zijn.

---

## Gevraagd besluit aan de opdrachtgever

1. **Akkoord op de AI-oplossingsrichting** (lokaal gehoste modellen + RAS + judge) als structurele basis.
2. **Akkoord op een borgingssprint** (beveiliging + privacy + opschoning) als eerste werk van het volgende team, vóór nieuwe features.
3. **Bevestiging van het uitgangspunt** dat de leraar altijd de eindbeslisser blijft.

Bij akkoord kan het volgende team direct starten met de [Technische overdracht](technisch-overdrachtsdocument.md) en de [suggestie voor de werkwijze & vervolgwerk](backlog-volgende-team.md).

---

## Bronnen

Dit advies bouwt voort op de literatuur en analyses uit het project. De volledige bronnenlijst staat in [Advies Juf Aimee](advies-juf-aimee.md); de meest relevante voor dit advies:

- College voor de Rechten van de Mens (2024). *Algoritmen in het onderwijs.* KBA Nijmegen / ResearchNed.
- Molenaar, I. (2022). Towards hybrid human–AI learning technologies. *European Journal of Education,* 57(4), 632–645.
- Es, S. et al. (2023). *RAGAS: Automated Evaluation of Retrieval Augmented Generation.*
- Pengcheng J. et al. (2025). *A survey on retrieval and structuring augmented generation with large language models.* arXiv:2509.10697.
