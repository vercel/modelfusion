---
sidebar_position: 2
title: SerpAPI
---

# SerpAPI WebSearch Tools

[SerpAPI](https://serpapi.com/) is a service that provides search results from Google, Bing, and other search engines.
Currently only the Google search is supported as a tool.

## Setup

1. Sign up at [SerpAPI](https://serpapi.com/) and get an API key.

2. Install the SerpAPI tools for ModelFusion:

   ```
   npm i @modelfusion/serpapi-tools
   ```

3. Add your SERPAPI_API_KEY to your environment variables or `.env` file.

## Usage

### Creating a SerpAPI Google Search Tool

```ts
import { SerpapiGoogleWebsearchTool } from "@modelfusion/serpapi-tools";

const websearchTool = new SerpapiGoogleWebsearchTool("search web", {
  description: "Search the web.",
  num: 3,
});
```

You can then use the tool with `useTool` or `executeTool`:

```ts
const result = await executeTool(websearchTool, {
  query: "modelfusion",
});
```
