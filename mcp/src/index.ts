import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const EDUREP_API_BASE = "https://api.edurep.nl/v1/jsonsearch";
const USER_AGENT = "edurep-app/1.0";

// Create server instance
const server = new McpServer({
  name: "edurep",
  version: "1.0.0",
});

interface EdurepRecord {
  title?: string;
  description?: string;
  url?: { location?: string };
  publisher?: { name?: string[] };
}

server.registerTool(
  "search_materials",
  {
    description: "Zoek educatief materiaal in de Edurep database",
    inputSchema: {
      query: z.string().describe("Het zoekwoord, bijv. 'plusklas' of 'rekenen groep 3'"),
    },
  },
  async ({ query }) => {
    const url = `${EDUREP_API_BASE}?query=${encodeURIComponent(query)}&maximumRecords=5`;

    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!response.ok) {
      return { content: [{ type: "text", text: `API fout: ${response.status}` }] };
    }

    const data = await response.json();
    const records = data.search?.records ?? [];

    if (records.length === 0) {
      return { content: [{ type: "text", text: "Geen resultaten gevonden." }] };
    }

    const tekst = records.map((record: EdurepRecord, index: number) => {
      const title = record.title ?? "Geen titel";
      const description = record.description ?? "";
      const url = record.url?.location ?? "";
      const publisher = record.publisher?.name?.[0] ?? "Onbekend";

      return `${index + 1}. ${title} (${publisher})\n${description}\n${url}`;
    }).join("\n\n");

    return { content: [{ type: "text", text: tekst }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();

