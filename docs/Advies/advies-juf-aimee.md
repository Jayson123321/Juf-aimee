# Advies: Juf Aimee AI-Assistent

**Leeruitkomst**: Advies     
**Deelnemers**:    

- Shehbaaz
- Jayson 

---

## Inleiding

Dit advies is gebaseerd op relevante inzichten in bestaande leerlingen platforms en wetenschappelijk onderzoek voor de Juf Aimee AI-assistent voor leraren met hoogbegaafde leerlingen. Wij hebben een prototype ontworpen; het is de bedoeling dat wij verder onderzoek doen naar bestaande leerplatforms en literatuur besturen zodat wij wetenschappelijk onderbouwde interpretaties in ons platform kunnen integreren. 

Daarnaast gaan wij ook gebruikerstesten uitvoeren bij echte leerkrachten zodat wij relevante feedback kunnen ontvangen op het leerplatform waar wij rekening mee kunnen houden bij het realiseren van het leerplatform.

**Adviesproces:**
- **Analyse:** Onderzoeken de behoefte/gebruiksgemak van de leraar
- **Ontwerp:** prototyping en testen

---

## Prototype voorbeeld

Dit is de versie van ons prototype, en daarin laat ik de onderdelen zien die we willen realiseren voor het leerplatform voor hoogbegaafde leerlingen.

### Dashboard 
![dashboard](images/dashboard.png)
>*in de voortangsbalk is met kleuren de progressie zichtbaar op het niveau waarbinnen de leerling werkt*

### Profiel leerling

![alt text](images/leerlingprofiel.png)
>*zichtbaar voor de leraar wat de eigenschappen en motivaties zijn van de leerling*

### Opdrachten aanbevelingen op leerlingprofiel en observaties

![alt text](<images/opdracht aanbeveling.png>)
>*Leerlingprofielen zijn leidend voor het genereren van nieuwe opdrachten, de observaties van de leraar wordt ook meegenomen in het samenstellen van de nieuwe opdracht*

### Opdracht generation 
![alt text](<images/opdracht genereren.png>)

>*hierin vult de leraar het vak in meestal gebaseerd op de interesses van de leerling om de nieuwe opdracht te genereren*

### Bronnen bibliotheek

![alt text](<images/bronnen bibliotheek.png>)

>*bibliotheek waarin gegenereerde opdrachten worden opgeslagen zodat ze kunnen helpen genereren van nieuwe opdrachten met meer uitdaging.*

## Inleiding

Dit advies is gebaseerd op een functioneel prototype van de Juf Aimee AI-assistent, een vernieuwend leerplatform specifiek ontworpen voor leraren die werken met hoogbegaafde leerlingen. Ons prototype is ontwikkeld met het AI-framework Retrieval-Augmented Generation die individuele Onderwijs Portfolio's (OPP's) van leerlingen analyseert en gepersonaliseerde ondersteuning biedt.

**Validatie:** 
- Proof-of-concept succesvol draait met 6 teststudenten en hun OPP-documenten
- RAG-pipeline verwerkt documenten tot vector embeddings voor contextueel zoeken
---

## Prototype voorbeeld

Ons werkende prototype toont de volgende functionaliteiten:

### AI Chat Interface
 Docenten kunnen natuurlijke taal vragen stellen zoals:
 * "Wat is het leerniveau van Julia?"
 * "Welke aandachtspunten zijn genoemd in Milan's OPP?"
 * "Toon me alle leerlingen in groep 6"

De AI-agent gebruikt twee tools:
1. **list_students** - toont alle leerlingen met ID, groep en Bloom-niveau
2. **search_opp** - doorzoekt het OPP van een specifieke leerling op_query

### Database Schema
 Onze Prisma schema ondersteunt:
 - **Studenten** met bloomNiveau 1-6 en groepindeling
 - **OppChunks** met vector embeddings voor semantic search
 - **Assignments** voor taken en voortgang
 - **User roles** voor beveiliging en toegangscontrole

### Dashboard Concept (gebouwd)
 - Overzicht van alle leerlingen
 - Bloom-niveau indicatie per leerling
 - Toegang tot individuele OPP-documenten
 - Integratie met AI-chat voor directe ondersteuning

---

## Aanbevelingen

### Aanbeveling 1  
**Advies:** Implementeer een *Retrieval And Structured Augmented Generation* (RAS) binnen het leerplatform, waarbij gestructureerde onderwijsgegevens zoals leerlingportfolio wordt gebruikt om AI-ondersteuning beter af te stemmen op de individuele leerling.

**Onderbouwing** 
Hoewel AI-systemen goed zijn in het vinden van relevante informatie, houden ze vaak onvoldoende rekening met de onderwijsstructuur en het leerproces van de leerling. Voor hoogbegaafde leerlingen is dit juist essentieel, omdat zij vaak:

- sneller door basisstof gaan  
- behoefte hebben aan verdieping in plaats van herhaling  
- verschillende leerstrategieën en interesses hebben  

De RAS-benadering voegt hier een belangrijke laag aan toe door:

- informatie niet alleen op relevantie, maar ook op voorgaande reflecties, voorkeuren en interesses van de leerling mee te nemen.  
- verbanden te leggen tussen onderwerpen en vaardigheden  
- rekening te houden met het portfolio en het huidige niveau.

**Maatschappelijke impact**

**Voor docenten**
- Betere ondersteuning bij het differentiëren in de klas  
- Inzicht in wat een leerling nodig heeft qua verdieping of versnelling  
- Minder tijd kwijt aan het zoeken naar passende lesmaterialen  
- Meer grip op het begeleiden van hoogbegaafde leerlingen  

**Voor leerlingen**
- Onderwijs dat beter aansluit bij hun denkniveau en interesses
- Meer uitdaging en minder frustratie door herhalingen
- Persoonlijk leerpad dat meegroeit met hun ontwikkeling  
- Stimulans voor kritisch en creatief denken  

---


### Aanbeveling 2
**Advies:** gescheiden en rolgebaseerde inlogschermen voor leerlingen, docenten en beheerders, waarbij elke gebruikersgroep toegang krijgt tot een eigen portaal met passende functionaliteiten en verantwoordelijkheden.

**Onderbouwing:**
Momenteel ontbreekt een duidelijke scheiding tussen verschillende gebruikersrollen binnen het platform. Dit kan leiden tot onoverzichtelijkheid, inefficiënt gebruik en mogelijke risico’s rondom toegang tot gevoelige informatie.

Door aparte inlogschermen te creëren voor:
- *leerlingen/leraren*
- *beheerders*  

ontstaat er een duidelijke structuur waarin elke gebruiker alleen toegang heeft tot relevante onderdelen van het systeem.

**Maatschappelijke Impact**
**Voor docenten:**
  - Overzichtelijke leeromgeving voor leraren
  - Snellere toegang tot leerlinggegevens en voortgang  
  - Minder afleiding door irrelevante functies  
  - Betere ondersteuning doordat leerlingen gekoppeld zijn aan een leraar 
    
**Voor leerlingen**
  - Eenvoudig leerlingportaal onder begeleiding van toegewezen leraar
  - Inzage in portfolio en opdrachten
  - Meer focus op eigen leeractiviteiten en voortgang  
  - Gevoel van veiligheid en structuur binnen het platform  
- 
**Voor onderwijs**
  - Evidence-based differentiatie
  - Standaardisering van competentie-beoordeling
  - Curriculum-ontwikkeling gebaseerd op klas-samenstelling

---

## Aanbeveling 3  
**Advies:** Een leerlingportaal met portfolio-opbouw, waarin leerlingactiviteiten, motivaties, zelfreflectie en samenkomen  samenkomen in één dynamisch leerlingprofiel.

**Onderbouwing**
Hoogbegaafde leerlingen hebben voordeel bij inzicht in hun eigen leerproces en ruimte voor zelfstandigheid. Veel bestaande systemen focussen op losse activiteiten of documentatie, maar missen een samenhangend overzicht van ontwikkeling, interesses en reflectie.

Deze aanbeveling stelt voor om een centrale leeromgeving te creëren waarin:

- leerlingen een overzicht hebben van afgeronde en geplande leeractiviteiten, inclusief deadlines
- resultaten van opdrachten eenvoudig kunnen worden ingeleverd en opgeslagen in een persoonlijk portfolio
- leerlingen na elke activiteit een korte zelfreflectie of evaluatie invullen  
- leerlingen hun voorkeuren en interesses kunnen aangeven en bijstellen  
- docenten gerichte feedback geven die gekoppeld wordt aan activiteiten en leerdoelen  

Hierdoor ontstaat een *dynamisch leerlingprofiel* dat continu wordt aangevuld met:
- resultaten  
- reflecties  
- feedback  
- interesses  

In plaats van statische documenten zoals traditionele OPP’s, biedt dit een doorlopende en uitgebreidere weergave van de ontwikkeling van de leerling.

**Maatschappelijke impact**

**Voor docenten**  
- Compleet en actueel beeld van de leerlingontwikkeling op één plek  
- Betere onderbouwing van begeleiding en differentiatie  
- Minder versnippering van informatie over prestaties en gedrag  
- Efficiëntere communicatie met collega’s en ouders  

**Voor leerlingen**
- Meer eigenaarschap over hun eigen leerproces  
- Inzicht in eigen groei, sterktes en interesses  
- Actieve rol via zelfreflectie en voorkeuren  
- Meer motivatie door persoonlijke en betekenisvolle leeractiviteiten  

---

## Vergelijking met bestaande oplossingen

### Arcadin: Een bewezen platform in het primair onderwijs

Arcadin is een operationeel leerplatform specifiek gericht op hoogbegaafde en talentvolle leerlingen in het primair onderwijs groep 1-8. Het platform biedt meer dan 650 leeractiviteiten die zijn afgestemd op niveau, interesses en vaardigheden van leerlingen. Belangrijke functionaliteiten van Arcadin zijn:

- *Leeractiviteiten zoeken en toewijzen* 
- met filters op groep, niveau en opdrachtduur
- *Online portfolio* waar leerlingen opdrachten inleveren, reflectieformulieren invullen en feedback van de leraar ontvangen
- *Beheerderstool* voor het aanmaken en koppelen van accounts
- *Deadline functionaliteit* en agenda-integratie
- *Flexibele opdrachtduur* geschikt zowel voor korte leermomenten als langere leerlijnen

### Waarom Juf Aimee deze punten moet verwerken

Hoewel Arcadin een uitgebreid en gebruiksvriendelijk platform is, mist het AI-integratie die kan helpen bij het differentiëren voor hoogbegaafde leerlingen op een schaalbare manier. De cruciale lessen uit Arcadin die verwerkt moeten worden in Juf Aimee zijn:

1. *Gebruikersvriendelijke filtering*: 
    Arcadin laat leraren gemakkelijk zoeken naar geschikte activiteiten via filters. Juf Aimee moet deze gebruiksvriendelijkheid overnemen in de AI-opdrachtgeneratie, waarbij de leraar makkelijk kan aanpassen aan niveau, duur en interesses.

2. *Portfolio-opbouw*: 
   Arcadin's leerlingportfolio zorgt voor een doorlopende verzameling van leerlingactiviteiten, werkresultaten, feedback en reflecties. Juf Aimee moet dit geheugen benutten: eerdere opdrachten, evaluaties en feedback moeten bijdragen tot betere AI-aanbevelingen, in plaats van elke sessie opnieuw te beginnen.

   *Afwisseling in opdrachtduur* 
   Bij Arcadin zijn er complexe opdrachten voor een lange leerlijn; dit zijn meestal abstracte opdrachten waar de leerling zelfstandig aan werkt. Er zijn ook opdrachten voor korte leermomenten bijvoorbeeld de laatste 10 minuten in de klas.

3. *Proactieve ondersteuning zonder overbodige automatisering*:
   Arcadin geeft de leraar volledige controle over welke opdrachten worden toegewezen. Juf Aimee moet deze filosofie overnemen: de AI signaleert en suggereert, maar de leraar blijft de eindverantwoordelijke die keuzes maakt.

4. *Integratie van leerlingreflectie*:
   Het evaluatieformulier in Arcadin geeft inzichten in wat leerlingen zelf als uitdagingen ervaren. Juf Aimee moet deze zelfreflecties verwerken in het bestaande leerlingprofiel zodat de AI opdrachten kan aanpassen aan zowel de door de leraar geobserveerde behoeften als de eigen evaluaties van de leerling.

5. *inlogschermen*: 
   Juf Aimee heeft momenteel geen aparte inlogschermen voor beheerders en leraren/leerlingen; deze scheiding is belangrijk voor de veiligheid en afscherming van de gebruikersrechten.

6. *Beheerderstool*: 
   Beheerders hebben een speciale omgeving waarin zij functionaliteiten hebben om leraren en leerlingen toe te voegen. Leerlingen en leraren hebben één inlogpagina, maar er is wel een apart leerlingen- en lerarenportaal.

Door deze elementen te combineren met AI-ondersteuning, positioneert Juf Aimee zich als een intelligent platform dat zowel de gebruikerservaring van Arcadin als de intelligentie van AI combineert specifiek gericht op onderwijzing rond hoogbegaafde leerlingen.


---

## Bronnen

- College voor de Rechten van de Mens (2024). *Algoritmen in het onderwijs.* KBA Nijmegen / ResearchNed.
- Google (n.d.). *PAIR Guidebook: People + AI Research.*
- Microsoft Research (2019). *Guidelines for Human-AI Interaction (HAX).*
- Molenaar, I. & Knoop-van Campen, C.A.N. (2019). How teachers make dashboard information actionable. *IEEE Transactions on Learning Technologies,* 12(3), 347–355.
- Molenaar, I. (2022). Towards hybrid human–AI learning technologies. *European Journal of Education,* 57(4), 632–645.
- Siegle, D. & McCoach, D.B. (2005). Making a difference: Motivating gifted students who are not achieving. *Teaching Exceptional Children,* 38(1), 22–27.
- Van Kessel, M., Molenaar, I. et al. (2025). Primary school teacher perspectives on effective dashboard use. *Journal of Learning Analytics,* 12(2), 279–292.
- Chen, J., Dai, D. Y., & Zhou, Y. (2013). Enable, Enhance, and Transform: How Technology Use Can Improve Gifted Education. Roeper Review, 35(3), 166–176. https://doi.org/10.1080/02783193.2013.794892
- Lisette H, A.C. Sven M, Jaap D, Anouke B. (2023). Academic motivation of intellectually gifted students and their classmates in regular primary school classes: A multidimensional, longitudinal, person- and variable-centered approach,
https://www.sciencedirect.com/science/article/pii/S1041608023000894?via%3Dihub
- Kahyaoglu, Mustafa. (2013) A comparision between gifted students and non-gifted students’ learning styles and their motivation styles
towards science learning
https://academicjournals.org/article/article1379768138_Kahyaoglu.pdf
- Pengcheng J, Siru O, Yizhu J, Ming Z, Runchu T, Jiawei H. (2025). A survey on retrieval and structuring augmented generation with large language models. arXiv. https://arxiv.org/abs/2509.10697





