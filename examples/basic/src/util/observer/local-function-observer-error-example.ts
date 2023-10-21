import dotenv from "dotenv";
import {
  OpenAIApiConfiguration,
  OpenAICompletionModel,
  generateText,
} from "modelfusion";
import { customObserver } from "./custom-observer";

dotenv.config();

async function main() {
  // Set the observer on the function call:
  const text = await generateText(
    new OpenAICompletionModel({
      api: new OpenAIApiConfiguration({
        baseUrl: "invalid-url",
      }),
      model: "gpt-3.5-turbo-instruct",
      maxCompletionTokens: 50,
    }),
    "Write a short story about a robot named Nox:\n\n",
    { observers: [customObserver] }
  );
}

main().catch(console.error);
