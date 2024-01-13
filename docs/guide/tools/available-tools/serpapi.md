---
sidebar_position: 10
title: SerpAPI
---

# SerpAPI WebSearch Tool

[[Source Code](https://github.com/lgrammel/modelfusion/tree/main/tools/serpapi-tool)]

[SerpAPI](https://serpapi.com/) is a service that provides search results from Google, Bing, and other search engines.
Currently only the Google search is supported as a tool.

## Setup

1. Sign up at [SerpAPI](https://serpapi.com/) and get an API key.

2. Install the SerpAPI tools for ModelFusion:

   ```
   npm i @modelfusion/serpapi-tool
   ```

3. Add `SERPAPI_API_KEY` with your SerpAPI api key to your environment variables or `.env` file.

## Usage

### Creating a SerpAPI Google Search Tool

```ts
import { SerpapiGoogleWebSearchTool } from "@modelfusion/serpapi-tool";

const websearchTool = new SerpapiGoogleWebSearchTool({
  name: "websearch",
  description: "Search the web.",
  num: 3,
});
```

You can then use the tool with `useTool` or `executeTool`:

```ts
const result = await executeTool({
  tool: websearchTool,
  args: {
    query: "modelfusion",
  },
});
```
