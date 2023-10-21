import dotenv from "dotenv";
import {
  OpenAICompletionModel,
  generateText,
  setGlobalFunctionObservers,
} from "modelfusion";
import { customObserver } from "./custom-observer";

dotenv.config();

async function main() {
  // Set a global funtion observer:
  setGlobalFunctionObservers([customObserver]);

  const text = await generateText(
    new OpenAICompletionModel({
      model: "gpt-3.5-turbo-instruct",
      maxCompletionTokens: 50,
    }),
    "Write a short story about a robot name Evo:\n\n"
  );
}

main().catch(console.error);
