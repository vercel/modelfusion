import dotenv from "dotenv";
import { generateText, openai, modelfusion } from "modelfusion";
import { customObserver } from "./custom-observer";

dotenv.config();

async function main() {
  // Set a global function observer:
  modelfusion.setFunctionObservers([customObserver]);

  const text = await generateText({
    model: openai.CompletionTextGenerator({
      model: "gpt-3.5-turbo-instruct",
      maxGenerationTokens: 50,
    }),
    prompt: "Write a short story about a robot name Evo:\n\n",
  });
}

main().catch(console.error);
