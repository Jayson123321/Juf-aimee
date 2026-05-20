# Game

De game-feature genereert automatisch een speelbaar HTML-spel dat is afgestemd op de leerling. Het spel wordt volledig door een AI gegenereerd op basis van het OPP-profiel, het gekozen Bloom-niveau en het schoolvak.

![gif](images/202605141848.gif)

## Hoe werkt het?

De leerkracht kiest een schoolvak, Bloom-niveau en geschatte tijdsduur. Vervolgens stuurt de applicatie een verzoek naar de API (`/api/assign` met `action: "generate_game"`). De API bouwt een gedetailleerde prompt op met het leerlingprofiel, de OPP-bronnen en de portfolioanalyse, en stuurt deze naar **Google Gemini 2.5 Flash**.

Gemini genereert een response met drie onderdelen:
- `TITLE` — de naam van het spel
- `GAME_HTML` — volledig werkende HTML/CSS/JavaScript-code voor het spel
- `RATIONALE` — uitleg waarom dit spel past bij de leerling

De gegenereerde HTML wordt vervolgens rechtstreeks in een `<iframe>` geladen zodat het spel direct speelbaar is in de browser.

## Technische keuzes

| Keuze | Reden |
|---|---|
| Google Gemini 2.5 Flash | Sterk in het genereren van code (HTML/JS); sneller en goedkoper dan Opus/GPT-4 voor codegeneratie |
| Volledig HTML in één bestand | Geen externe dependencies nodig; werkt in een sandboxed iframe |
| Iframe `srcDoc` | Veilige sandbox: het spel heeft geen toegang tot de rest van de applicatie |

## Inputs

| Parameter | Beschrijving |
|---|---|
| `studentId` | De leerling voor wie het spel wordt gegenereerd |
| `focusArea` | Het schoolvak (bijv. "Rekenen", "Taal") |
| `bloomLevel` | Het gewenste denkniveau (Bloom-taxonomie) |
| `estimatedTime` | Hoelang het spel moet duren |
| `teacherPrompt` | Optionele extra instructie van de leerkracht |
