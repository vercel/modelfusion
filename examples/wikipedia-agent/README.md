# Wikipedia Agent

> _terminal app_, _ReAct agent_, _GPT-4_, _OpenAI functions_, _tools_

### Setup

https://developers.google.com/custom-search/v1/introduction

### Usage

1. Create .env file with the following content:

   ```
   OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
   GOOGLE_CUSTOM_SEARCH_API_KEY="YOUR_GOOGLE_CUSTOM_SEARCH_API_KEY"
   GOOGLE_CUSTOM_SEARCH_ENGINE_ID="YOUR_GOOGLE_CUSTOM_SEARCH_ENGINE_ID_FOR_WIKIPEDIA"
   ```

2. Run the following commands:

   ```sh
   npm install
   npx ts-node src/WikipediaReactAgent.ts --question "Who was born first, Einstein or Picasso?"
   ```
