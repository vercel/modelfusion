import { SerpapiGoogleWebSearchTool } from "@modelfusion/serpapi-tool";
import dotenv from "dotenv";
import { executeTool } from "modelfusion";

dotenv.config();

async function main() {
  const websearchTool = new SerpapiGoogleWebSearchTool({
    name: "websearch",
    description: "Search the web.",
    num: 3,
  });

  const result = await executeTool(websearchTool, {
    query: "modelfusion",
  });

  console.log(result);
}

main().catch(console.error);
