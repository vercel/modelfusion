# MediaWiki Search Tool for ModelFusion

Searches MediaWiki instances, such as Wikipedia, using their `opensearch` API endpoint.

## Installation

```sh
npm install @modelfusion/mediawiki-search-tool
```

## Usage

```ts
import { MediaWikiSearchTool } from "@modelfusion/mediawiki-search-tool";

const searchWikipedia = new MediaWikiSearchTool({
  url: "https://en.wikipedia.org/w/api.php",
  name: "search_wikipedia",
  description: "Search Wikipedia pages using a query",
  profile: "fuzzy",
  maxResults: 5,
});
```

You can then use the tool with `runTool` or `executeTool`:

```ts
const result = await executeTool(searchWikipedia, {
  query: "Albert Einstein",
});
```
