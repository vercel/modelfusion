import dotenv from "dotenv";
import {
  OpenAITextGenerationModel,
  generateText,
  guard,
  setGlobalFunctionLogging,
} from "modelfusion";

dotenv.config();

setGlobalFunctionLogging("detailed-object");

async function main() {
  const story = await guard(
    (input) =>
      generateText(
        new OpenAITextGenerationModel({
          model: "gpt-3.5-turbo-instruct",
          temperature: 0.7,
          maxCompletionTokens: 250,
        }),
        input
      ),
    "Write a short story about a robot called Nox:\n\n", // without including the word Nox
    async (result) => {
      if (result.type === "value" && result.output.includes("Nox")) {
        return {
          action: "return",
          output: "I cannot generate the requested story.",
        };
      }
    }
  );

  console.log(story);
}

main().catch(console.error);
