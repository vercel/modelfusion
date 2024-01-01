import { MediaWikiSearchTool } from "@modelfusion/mediawiki-search-tool";

export const searchWikipedia = new MediaWikiSearchTool({
  url: "https://en.wikipedia.org/w/api.php",
  name: "search_wikipedia",
  description: "Search Wikipedia pages using a query",
  profile: "fuzzy",
  maxResults: 5,
});
