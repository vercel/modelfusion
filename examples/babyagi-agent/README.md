# BabyAGI Agent

> _terminal app_, _agent_, _BabyAGI_

TypeScript implementation of the BabyAGI classic and BabyBeeAGI.

## BabyAGI Classic

TypeScript implementation of the classic [BabyAGI](https://github.com/yoheinakajima/babyagi/blob/main/classic/babyagi.py) ([Tweet](https://twitter.com/yoheinakajima/status/1640934493489070080)) by [@yoheinakajima](https://twitter.com/yoheinakajima) without embeddings.

### Usage

1. Create .env file with the following content:

   ```
   OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
   ```

2. Run the following commands:

   ```sh
   pnpm install
   pnpm tsx src/BabyAGI.ts --objective "Solve world hunger."
   ```

## BabyBeeAGI

TypeScript implementation of [BabyBeeAGI](https://github.com/yoheinakajima/babyagi/blob/main/classic/BabyBeeAGI.py) ([Tweet](https://twitter.com/yoheinakajima/status/1652732735344246784)) by [@yoheinakajima](https://twitter.com/yoheinakajima) with mandatory SerpAPI usage and a minor JSON parsing improvement.

### Usage

1. Create .env file with the following content:

   ```
   OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
   SERPAPI_API_KEY="YOUR_SERPAPI_API_KEY"
   ```

2. Run the following commands:

   ```sh
   pnpm install
   pnpm tsx src/BabyBeeAGI.ts --objective "Research and write a short text about the BabyAGI project"
   ```
