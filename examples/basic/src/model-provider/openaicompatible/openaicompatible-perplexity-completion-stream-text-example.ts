import dotenv from "dotenv";
import { openaicompatible, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText({
    model: openaicompatible
      .ChatTextGenerator({
        api: openaicompatible.PerplexityApi(),
        provider: "openaicompatible-perplexity",
        model: "pplx-70b-online", // online model with access to web search
        maxGenerationTokens: 500,
      })
      .withTextPrompt(),

    prompt: "What is RAG in AI?",
  });

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
