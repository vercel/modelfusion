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
    [
      async (result) => {
        if (result.type !== "error" && result.output.includes("Nox")) {
          return {
            action: "throwError",
            error: new Error("story must not contain word 'Nox'"),
          };
        }
      },
    ]
  );

  console.log(story);
}

main().catch(console.error);
