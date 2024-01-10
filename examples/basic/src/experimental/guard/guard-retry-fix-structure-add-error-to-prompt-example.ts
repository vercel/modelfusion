import dotenv from "dotenv";
import { generateStructure, modelfusion, openai, zodSchema } from "modelfusion";
import { fixStructure, guard } from "modelfusion-experimental";
import { z } from "zod";

dotenv.config();

modelfusion.setLogFormat("basic-text");

async function main() {
  const sentiment = await guard(
    (input, options) =>
      generateStructure(
        openai
          .ChatTextGenerator({
            model: "gpt-3.5-turbo",
            temperature: 0,
            maxGenerationTokens: 50,
          })
          .asFunctionCallStructureGenerationModel({
            fnName: "sentiment",
            fnDescription: "Write the sentiment analysis",
          }),

        zodSchema(
          z.object({
            sentiment: z
              .enum(["positive", "neutral", "negative"])
              .describe("Sentiment."),
          })
        ),
        input,
        options
      ),
    [
      openai.ChatMessage.system(
        "You are a sentiment evaluator. " +
          "Analyze the sentiment of the following product review:"
      ),
      openai.ChatMessage.user(
        "After I opened the package, I was met by a very unpleasant smell " +
          "that did not disappear even after washing. Never again!"
      ),
    ],
    fixStructure({
      modifyInputForRetry: async ({ input, error }) => [
        ...input,
        openai.ChatMessage.assistant(null, {
          functionCall: {
            name: "sentiment",
            arguments: JSON.stringify(error.valueText),
          },
        }),
        openai.ChatMessage.user(error.message),
        openai.ChatMessage.user("Please fix the error and try again."),
      ],
    })
  );

  console.log(JSON.stringify(sentiment, null, 2));
}

main().catch(console.error);
