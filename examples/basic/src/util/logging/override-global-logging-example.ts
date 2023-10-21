import dotenv from "dotenv";
import {
  OpenAICompletionModel,
  generateText,
  setGlobalFunctionLogging,
} from "modelfusion";

dotenv.config();

async function main() {
  console.log();
  console.log("Logging: off (override)");
  console.log();

  setGlobalFunctionLogging("basic-text");

  const text = await generateText(
    new OpenAICompletionModel({
      model: "gpt-3.5-turbo-instruct",
      maxCompletionTokens: 50,
    }),
    "Write a short story about a robot learning to love:\n\n",
    { logging: "off" } // overrides global logging
  );
}

main().catch(console.error);
