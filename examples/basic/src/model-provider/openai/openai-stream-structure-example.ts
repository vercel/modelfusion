import dotenv from "dotenv";
import {
  OpenAIChatMessage,
  OpenAIChatModel,
  ZodStructureDefinition,
  fixJson,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const model = new OpenAIChatModel({
    model: "gpt-3.5-turbo",
    temperature: 0,
    maxCompletionTokens: 50,
  });

  const stream = await model.generateStructureStreamResponse(
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

  for await (const event of stream) {
    if (event.type === "delta") {
      const fullDelta = event.fullDelta;
      const partialStructure = model.extractPartialStructure(fullDelta)!;

      // TODO use just deep compare to prevent the same json to come up twice

      let json = null;
      try {
        json = JSON.parse(partialStructure);
      } catch (ignored) {
        try {
          const fixedStructure = fixJson(partialStructure);
          json = JSON.parse(fixedStructure);
        } catch (ignored2) {}
      }

      console.log(json);
    }
  }
}

main().catch(console.error);
