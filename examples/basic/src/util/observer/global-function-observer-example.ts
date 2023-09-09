import dotenv from "dotenv";
import {
  OpenAITextGenerationModel,
  generateText,
  setGlobalFunctionObservers,
} from "modelfusion";
import { customObserver } from "./custom-observer";

dotenv.config();

async function main() {
  // Set a global funtion observer:
  setGlobalFunctionObservers([customObserver]);

  const text = await generateText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      maxCompletionTokens: 50,
    }),
    "Write a short story about a robot name Evo:\n\n"
  );
}

main().catch(console.error);
