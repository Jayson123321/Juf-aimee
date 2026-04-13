# Sprint 3

## Sprint 3 doelen

- Coach feedback uit sprint 2 verwerken
- AI features uitbreiden (RAS integreren)
- Onderzoek naar AI-model
- Adviseren over AI features

## Resultaten

### Verwerking coach feedback — documentatiestructuur

**Ontvangen feedback na sprint 2:**

> "Het is wel erg lastig doorzoekbaar als (relatieve) buitenstaander. Delen staan op pages, en delen op losse md-files, en delen op issue board… Zorg alsjeblieft dat jullie dat samen oplossen."

**Wat was het probleem?**

De documentatie was verspreid over meerdere plekken zonder duidelijke samenhang:
- Losse markdown-bestanden zonder intro of context
- Geen logische navigatievolgorde voor buitenstaanders
- De homepage (`index.md`) was leeg — geen uitleg over het project

**Wat hebben we gedaan?**

- **Homepage herschreven** (`docs/index.md`): bevat nu een projectomschrijving, statusoverzicht en een navigatiegids die naar elke sectie verwijst
- **Logische navigatievolgorde** ingesteld via `.pages` bestanden: van onderzoek → ontwerp → advies → techniek → proces
- **Intro-pagina's toegevoegd** aan alle hoofdsecties (Onderzoek, Prototype, Advies, Sprints): elke sectie begint nu met een overzicht van wat je erin vindt
- **Sitebeschrijving** in `mkdocs.yml` aangepast naar "Juf Aimee — AI-onderwijsassistent"
