import dotenv from "dotenv";
import { generateText, openai, setGlobalFunctionLogging } from "modelfusion";

dotenv.config();

async function main() {
  console.log();
  console.log("Logging: off (override)");
  console.log();

  setGlobalFunctionLogging("basic-text");

  const text = await generateText(
    openai.CompletionTextGenerator({
      model: "gpt-3.5-turbo-instruct",
      maxCompletionTokens: 50,
    }),
    "Write a short story about a robot learning to love:\n\n",
    { logging: "off" } // overrides global logging
  );
}

main().catch(console.error);
