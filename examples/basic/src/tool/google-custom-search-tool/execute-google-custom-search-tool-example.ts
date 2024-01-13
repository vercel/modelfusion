import { GoogleCustomSearchTool } from "@modelfusion/google-custom-search-tool";
import dotenv from "dotenv";
import { executeTool } from "modelfusion";

dotenv.config();

async function main() {
  const wikipediaSearchTool = new GoogleCustomSearchTool({
    name: "search_wikipedia",
    description: "Search Wikipedia pages using a query",
    searchEngineId: "76fe2b5e95a3e4215",
    maxResults: 5,
  });

  const result = await executeTool({
    tool: wikipediaSearchTool,
    args: {
      query: "javascript",
    },
  });

  console.log(result);
}

main().catch(console.error);
