# OPP similarity test (simpel uitgelegd)

## Waarom deze test?

We willen controleren of ons systeem goed snapt welke OPP-teksten op elkaar lijken.

- Teksten die inhoudelijk op elkaar lijken → **hoge score** (dicht bij 1).
- Teksten die weinig met elkaar te maken hebben → **lagere score** (dichter bij 0).

We gebruiken hiervoor:

- embeddings (getallenlijsten) gemaakt met het model `jeffh/intfloat-multilingual-e5-large:f16` via Ollama;
- de `OppChunk`-tabel in de database met een `embedding` kolom (pgvector).

---

## Test 1: Eigen beschrijving van een leerling

**Script**: `scripts/test-similarity.ts`

**Ingevoerde tekst**

> De leerling denkt op hoog niveau en maakt snel nieuwe verbindingen. Tegelijk laat hij perfectionisme zien en kan hij blokkeren als een taak niet in één keer goed gaat. Hij heeft baat bij verrijkingsopdrachten en begeleiding in omgaan met fouten.

**Wat we doen**

1. De database is gevuld met OPP-tekstjes (via `npm run ingest`).
2. We draaien:

  ```bash
  npx tsx scripts/test-similarity.ts
  ```

3. Het script maakt een embedding van de tekst hierboven en zoekt in alle OPP-chunks.

**Wat we zagen in de output**

De topresultaten zijn teksten zoals:

- "Hoge betrokkenheid bij betekenisvolle, moeilijke opdrachten. Weinig motivatie voor automatiseren en herhalen." (Similarity ~0.90)
- "Ze onthoudt informatie snel en kan zelfstandig onderzoeksvragen formuleren. Opstarten, plannen en afronden van taken kost moeite wanneer motivatie ontbreekt." (Similarity ~0.89)
- "Julia is een cognitief zeer sterke leerling met een uitgesproken verbaal redeneervermogen en een grote behoefte aan inhoudelijke uitdaging." (Similarity ~0.87)
- Teksten over hulp nodig hebben bij plannen, omgaan met fouten, sterke cognitieve capaciteiten.

De meeste scores liggen tussen **0.86 en 0.90**.

**Conclusie bij Test 1**

De handmatig ingevoerde beschrijving gaat over een hoogbegaafde, perfectionistische leerling met behoefte aan uitdaging en begeleiding. Het systeem vindt daarbij OPP-teksten die precies over dit soort profiel gaan, met hoge similarity-scores. Dat betekent dat de similarity-zoekactie inhoudelijk klopt.

---

## Test 2: Exact dezelfde tekst (score 1.0)

**Script**: `scripts/test-similarity-self.ts`

**Wat we doen**

1. We draaien:

  ```bash
  npx tsx scripts/test-similarity-self.ts
  ```

2. Het script:
  - pakt één bestaand OPP-tekstje (`OppChunk`) uit de database (bijvoorbeeld de kop van het OPP van Julia);
  - maakt opnieuw een embedding van **dezelfde** tekst;
  - zoekt weer in alle OPP-chunks op similarity.

**Wat we zagen in de output**

- De eerste regel in de lijst is precies dezelfde chunk:
  - `Chunk ID: 1 ... <= zelfde chunk`
  - `Similarity: 1.000`
- Daarna volgen de kopteksten van de andere OPP's (Sophie, Noah, Daan, Emma, Milan) met similarity rond **0.90**.
- Daarna komen andere, inhoudelijk gerelateerde stukken met lagere scores (ca. 0.83–0.87).

**Conclusie bij Test 2**

- De tekst die we erin stoppen, komt als **eerste terug met similarity 1.000** → identieke tekst wordt perfect herkend.
- Andere, sterk lijkende OPP-koppen krijgen net iets lagere scores (~0.90).
- Dit laat zien dat onze embeddings en pgvector-instellingen technisch goed werken en dat dezelfde tekst steeds in hetzelfde "punt" in de vectorruimte terechtkomt.


## Algemene conclusie

Met deze twee testen zien we:

- Inhoudelijk vergelijkbare OPP-teksten krijgen hoge similarity-scores.
- Exact dezelfde tekst krijgt een similarity van 1.000 en staat bovenaan.

Daarmee is aangetoond dat we OPP's op inhoud kunnen vergelijken met behulp van embeddings en similarity-search.
