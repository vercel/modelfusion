import dotenv from "dotenv";
import {
  OpenAIChatMessage,
  OpenAIChatModel,
  ZodStructureDefinition,
  generateStructure,
  guard,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const sentiment = await guard(
    (input) =>
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
              .enum(["positive", "neutral", "negative"])
              .describe("Sentiment."),
          }),
        }),
        input
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
    [
      {
        isValid: async (result) => result.type === "value",
        whenInvalid: "retry",
        modifyInputForRetry: async (result) => [
          ...result.input,
          OpenAIChatMessage.functionResult(
            "error",
            JSON.stringify(result.error)
          ),
        ],
      },
    ]
  );

  console.log(JSON.stringify(sentiment, null, 2));
}

main().catch(console.error);
