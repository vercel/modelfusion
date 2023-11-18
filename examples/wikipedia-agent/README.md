# Wikipedia Agent

> _terminal app_, _ReAct agent_, _GPT-4_, _OpenAI functions_, _tools_

Get answers to questions from Wikipedia, e.g. "Who was born first, Einstein or Picasso?"

## Setup

1. Create a programmable search engine for Wikipedia

   You need to create a [programmable search engine](https://programmablesearchengine.google.com/about/) for Wikipedia. When you set up the search engine, configure the site to be `en.wikipedia.org/*`.
   The search engine id on the overview page.
   You can get the [api key in the documentation](https://developers.google.com/custom-search/v1/introduction) ("Get a Key"). You need to create a Google cloud project to get the api key.

2. Create .env file with the following content:

   ```
   OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
   GOOGLE_CUSTOM_SEARCH_API_KEY="YOUR_GOOGLE_CUSTOM_SEARCH_API_KEY"
   ```

3. Update the searchEngineId in the `WikipediaReactAgent.ts` file.

### Usage

Run the following commands:

```sh
npm install
npx tsx src/WikipediaReactAgent.ts --question "Who was born first, Einstein or Picasso?"
```
