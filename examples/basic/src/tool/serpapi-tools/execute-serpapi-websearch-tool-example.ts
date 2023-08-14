import { SerpapiGoogleWebsearchTool } from "@modelfusion/serpapi-tools";
import dotenv from "dotenv";
import { executeTool } from "modelfusion";

dotenv.config();

(async () => {
  const websearchTool = new SerpapiGoogleWebsearchTool({
    name: "websearch",
    description: "Search the web.",
    num: 3,
  });

  const result = await executeTool(websearchTool, {
    query: "modelfusion",
  });

  console.log(result);
})();
