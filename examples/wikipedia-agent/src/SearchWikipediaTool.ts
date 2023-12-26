import { GoogleCustomSearchTool } from "@modelfusion/google-custom-search-tool";

export const searchWikipedia = new GoogleCustomSearchTool({
  name: "search_wikipedia",
  searchEngineId: "76fe2b5e95a3e4215",
  description: "Search Wikipedia pages using a query",
  maxResults: 5,
});
