import dotenv from "dotenv";
import { DefaultRun, generateText, openai } from "modelfusion";
import { customObserver } from "./custom-observer";

dotenv.config();

async function main() {
  // Set the observer on the run:
  const run = new DefaultRun({
    observers: [customObserver],
  });

  const text = await generateText({
    model: openai.CompletionTextGenerator({
      model: "gpt-3.5-turbo-instruct",
      maxGenerationTokens: 50,
    }),
    prompt: "Write a short story about a robot named Pam:\n\n",
    run,
  });
}

main().catch(console.error);
