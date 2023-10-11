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
  const sentiment = await guard(
    (input) =>
      generateText(
        new OpenAITextGenerationModel({
          model: "gpt-3.5-turbo-instruct",
          temperature: 0.7,
          maxCompletionTokens: 500,
        }),
        input
      ),
    "Write a short story about a robot called Nox:\n\n",
    [
      {
        isValid: async (result) => {
          if (result.type === "value") {
            // count the number of times the word "Nox" appears
            const count = (result.output.match(/Nox/g) ?? []).length;

            console.log("count", count);

            // if the word "Nox" appears less than 12 times, reask
            if (count < 12) {
              return false;
            }
          }

          return true;
        },
        action: "reask",
        modifyInput: async (result) =>
          [
            result.output,
            "Rewrite the story such that the word 'Nox' appears at least 12 times.",
          ].join("\n\n"),
      },
    ]
  );

  console.log(JSON.stringify(sentiment, null, 2));
}

main().catch(console.error);
