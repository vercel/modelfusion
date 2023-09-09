import {
  OpenAITextGenerationModel,
  generateText,
  setGlobalFunctionLogging,
} from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log();
  console.log("Logging: basic-text");
  console.log();

  setGlobalFunctionLogging("basic-text");

  const text = await generateText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      maxCompletionTokens: 50,
    }),
    "Write a short story about a robot learning to love:\n\n"
  );
}

main().catch(console.error);
