# Edurep MCP Server

Een zelfgebouwde [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server die educatief lesmateriaal opzoekt via de [Edurep API](https://edurep.kennisnet.nl) van Kennisnet.

---

## Hoe werkt het?

MCP is een protocol waarmee AI-assistenten zoals Claude tools kunnen aanroepen. Een MCP server is een apart proces dat tools aanbiedt, in dit geval het zoeken naar lesmateriaal.

Er zijn twee transport types:
- **HTTP** - de server draait ergens op een URL
- **stdio** - de server draait lokaal als een proces, communicatie via stdin/stdout

Deze server gebruikt **stdio**: Claude start het Node.js script lokaal op en communiceert via stdin/stdout. Er is geen API key of URL nodig.

```
Claude Desktop / Claude Code
        ↕ stdin/stdout
   node dist/index.js
        ↕ HTTP
   proxy.edurep.nl/v3/search
```

---

## Mappenstructuur

```
mcp/
├── src/
│   └── index.ts        # MCP server: tools en Edurep logica
├── dist/
│   └── index.js        # Gecompileerde output (gegenereerd door tsc)
├── package.json
└── tsconfig.json
```

---

## Installatie

```bash
cd mcp
npm install
npm run build
```

---

## Beschikbare tools

### `search_materials`
Zoekt educatief materiaal in de Edurep database.

| Parameter | Type | Beschrijving |
|---|---|---|
| `query` | string | Zoekterm, bijv. `plusklas` of `rekenen groep 3` |

---

## Koppelen aan Claude Code

Maak een `.mcp.json` aan in de root van je project:

```json
{
  "mcpServers": {
    "edurep": {
      "type": "stdio",
      "command": "node",
      "args": ["./mcp/dist/index.js"]
    }
  }
}
```

Of via de CLI:

```bash
claude mcp add-json edurep '{"type":"stdio","command":"node","args":["./mcp/dist/index.js"]}'
```

---

## Koppelen aan Claude Desktop

Voeg toe aan `%APPDATA%\Claude\claude_desktop_config.json` (Windows) of `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac):

```json
{
  "mcpServers": {
    "edurep": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": ["C:/pad/naar/juf-aimee/mcp/dist/index.js"]
    }
  }
}
```

Herstart Claude Desktop na het aanpassen van de config. De server verschijnt daarna onder `+` → Connectors → edurep.

---

## Edurep API

De server maakt gebruik van het [Edurep jsonsearch endpoint](https://developers.wiki.kennisnet.nl/index.php?title=Edurep:Jsonsearch):

```
https://proxy.edurep.nl/v3/search?mode=json&query="zoekterm"&page-size=5
```

Geen API key nodig, Edurep is een publieke API.
