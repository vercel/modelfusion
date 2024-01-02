---
sidebar_position: 12
title: Google Custom Search
---

# Google Custom Search Tool

[[Source Code](https://github.com/lgrammel/modelfusion/tree/main/tools/google-custom-search-tool)]

[Google Custom Search](https://developers.google.com/custom-search/v1/overview) lets you create programmable search engines that are limited to a subset of the web (e.g. a domain or a set of domains) and access the results via an API.

## Setup

1. Create a [Google Custom Search Engine](https://cse.google.com/cse/all).
2. Record the Search Engine ID.
3. Get an [API Key](https://developers.google.com/custom-search/v1/introduction). You will need to create a Google Cloud Platform project and enable the Custom Search API.
4. Install the Google custom search tool for ModelFusion:

   ```
   npm i @modelfusion/google-custom-search-tool
   ```

5. Add `GOOGLE_CUSTOM_SEARCH_API_KEY` with your API key to your environment variables or `.env` file.

## Usage

### Creating a Custom Google Search Tool

```ts
import { GoogleCustomSearchTool } from "@modelfusion/google-custom-search-tool";

const searchWikipedia = new GoogleCustomSearchTool({
  name: "search_wikipedia",
  description: "Search Wikipedia pages using a query",
  searchEngineId: "76fe2b5e95a3e4215", // replace with your search engine id
  maxResults: 5,
});
```

You can then use the tool with `useTool` or `executeTool`:

```ts
const result = await executeTool(searchWikipedia, {
  query: "Pablo Picasso",
});
```
