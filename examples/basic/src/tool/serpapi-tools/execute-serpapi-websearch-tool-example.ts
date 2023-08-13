import { SerpapiGoogleWebsearchTool } from "@modelfusion/serpapi-tools";
import dotenv from "dotenv";
import { executeTool } from "modelfusion";

dotenv.config();

(async () => {
  const websearch = new SerpapiGoogleWebsearchTool("search web", {
    description: "Search the web.",
    num: 3,
  });

  const result = await executeTool(websearch, {
    query: "modelfusion",
  });

  console.log(result);
})();
