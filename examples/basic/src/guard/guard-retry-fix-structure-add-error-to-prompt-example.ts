import dotenv from "dotenv";
import {
  OpenAIChatMessage,
  fixStructure,
  generateStructure,
  guard,
  modelfusion,
  openai,
  zodSchema,
} from "modelfusion";
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
            maxCompletionTokens: 50,
          })
          .asFunctionCallStructureGenerationModel({
            fnName: "sentiment",
            fnDescription: "Write the sentiment analysis",
          }),

        zodSchema(
          z.object({
            sentiment: z
              .enum(["positivee", "neutra", "negaaa"])
              .describe("Sentiment."),
          })
        ),
        input,
        options
      ),
    [
      OpenAIChatMessage.system(
        "You are a sentiment evaluator. " +
          "Analyze the sentiment of the following product review:"
      ),
      OpenAIChatMessage.user(
        "After I opened the package, I was met by a very unpleasant smell " +
          "that did not disappear even after washing. Never again!"
      ),
    ],
    fixStructure({
      modifyInputForRetry: async ({ input, error }) => [
        ...input,
        OpenAIChatMessage.assistant(null, {
          functionCall: {
            name: "sentiment",
            arguments: JSON.stringify(error.valueText),
          },
        }),
        OpenAIChatMessage.user(error.message),
        OpenAIChatMessage.user("Please fix the error and try again."),
      ],
    })
  );

  console.log(JSON.stringify(sentiment, null, 2));
}

main().catch(console.error);
