import dotenv from "dotenv";
import {
  OpenAICompletionModel,
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
        new OpenAICompletionModel({
          model: "gpt-3.5-turbo-instruct",
          temperature: 0.7,
          maxCompletionTokens: 500,
        }),
        input
      ),
    "Write a short story about a robot called Nox:\n\n",
    async (result) => {
      if (result.type === "value") {
        // count the number of times the word "Nox" appears:
        const count = (result.output.match(/Nox/g) ?? []).length;

        // if the word "Nox" appears less than 12 times, retry
        if (count < 12) {
          return {
            action: "retry",
            input: [
              result.output,
              "Rewrite the story such that the word 'Nox' appears at least 12 times.",
            ].join("\n\n"),
          };
        }
      }
    }
  );

  console.log(story);
}

main().catch(console.error);
