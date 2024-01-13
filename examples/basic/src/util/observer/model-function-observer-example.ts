import dotenv from "dotenv";
import { generateText, openai } from "modelfusion";
import { customObserver } from "./custom-observer";

dotenv.config();

async function main() {
  // Set the observer on the model:
  const text = await generateText({
    model: openai.CompletionTextGenerator({
      model: "gpt-3.5-turbo-instruct",
      maxGenerationTokens: 50,
      observers: [customObserver],
    }),
    prompt: "Write a short story about a robot name Bud:\n\n",
  });
}

main().catch(console.error);
