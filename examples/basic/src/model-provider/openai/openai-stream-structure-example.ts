import dotenv from "dotenv";
import {
  OpenAIChatMessage,
  OpenAIChatModel,
  ZodStructureDefinition,
  streamStructure,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const stream = await streamStructure(
    new OpenAIChatModel({
      model: "gpt-3.5-turbo",
      temperature: 0,
      maxCompletionTokens: 50,
    }),
    new ZodStructureDefinition({
      name: "sentiment" as const,
      description: "Write the sentiment analysis",
      schema: z.object({
        sentiment: z
          .enum(["positive", "neutral", "negative"])
          .describe("Sentiment."),
      }),
    }),
    [
      OpenAIChatMessage.system(
        "You are a sentiment evaluator. " +
          "Analyze the sentiment of the following product review:"
      ),
      OpenAIChatMessage.user(
        "After I opened the package, I was met by a very unpleasant smell " +
          "that did not disappear even after washing. Never again!"
      ),
    ]
  );

  for await (const partialStructure of stream) {
    console.log(partialStructure);
  }
}

main().catch(console.error);
