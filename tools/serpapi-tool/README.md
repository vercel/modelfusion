# SerpAPI WebSearch Tool for ModelFusion

[SerpAPI](https://serpapi.com/) is a service that provides search results from Google, Bing, and other search engines.
Currently only the Google search is supported as a tool.

## Requirements

- [ModelFusion](https://modelfusion.dev) v0.106.0 or higher

## Setup

1. Sign up at [SerpAPI](https://serpapi.com/) and get an API key.

2. Install the SerpAPI tools for ModelFusion:

   ```
   npm i @modelfusion/serpapi-tool
   ```

3. Add your SERPAPI_API_KEY to your environment variables or `.env` file.

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
const result = await executeTool(websearchTool, {
  query: "modelfusion",
});
```
