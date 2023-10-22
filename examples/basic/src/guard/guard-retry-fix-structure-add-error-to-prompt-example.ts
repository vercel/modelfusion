import dotenv from "dotenv";
import {
  OpenAIChatMessage,
  OpenAIChatModel,
  ZodStructureDefinition,
  fixStructure,
  generateStructure,
  guard,
  setGlobalFunctionLogging,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

setGlobalFunctionLogging("detailed-object");

async function main() {
  const sentiment = await guard(
    (input, options) =>
      generateStructure(
        new OpenAIChatModel({
          model: "gpt-3.5-turbo",
          temperature: 0,
          maxCompletionTokens: 50,
        }),
        new ZodStructureDefinition({
          name: "sentiment",
          description: "Write the sentiment analysis",
          schema: z.object({
            sentiment: z
              .enum(["positivee", "neutra", "negaaa"])
              .describe("Sentiment."),
          }),
        }),
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
        OpenAIChatMessage.functionCall(null, {
          name: error.structureName,
          arguments: error.valueText,
        }),
        OpenAIChatMessage.user(error.message),
        OpenAIChatMessage.user("Please fix the error and try again."),
      ],
    })
  );

  console.log(JSON.stringify(sentiment, null, 2));
}

main().catch(console.error);
