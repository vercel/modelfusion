import dotenv from "dotenv";
import {
  OpenAIChatMessage,
  ZodStructureDefinition,
  generateStructure,
  openai,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const analyzeSentiment = async (productReview: string) =>
    generateStructure(
      openai.ChatTextGenerator({
        model: "gpt-4",
        temperature: 0, // remove randomness
        maxCompletionTokens: 500, // enough tokens for reasoning and sentiment
      }),
      new ZodStructureDefinition({
        name: "sentiment",
        description: "Write the sentiment analysis",
        schema: z.object({
          // Reason first to improve results:
          reasoning: z.string().describe("Reasoning to explain the sentiment."),
          // Report sentiment after reasoning:
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
        OpenAIChatMessage.user(productReview),
      ]
    );

  const result1 = await analyzeSentiment(
    "After I opened the package, I was met by a very unpleasant smell " +
      "that did not disappear even after washing. The towel also stained " +
      "extremely well and also turned the seal of my washing machine red. " +
      "Never again!"
  );

  console.log(JSON.stringify(result1, null, 2));

  const result2 = await analyzeSentiment(
    "I love this towel so much! " +
      "It dries so fast and carries so much water. " +
      "It's so light and thin, I will take it everywhere I go! " +
      "I will definitely purchase again."
  );

  console.log(JSON.stringify(result2, null, 2));
}

main().catch(console.error);
