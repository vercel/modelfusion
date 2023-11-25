import dotenv from "dotenv";
import { ZodSchema, generateStructure, openai } from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const sentiment = await generateStructure(
    openai
      .ChatTextGenerator({
        model: "gpt-3.5-turbo",
        temperature: 0,
        maxCompletionTokens: 50,
      })
      .asFunctionCallStructureGenerationModel({
        fnName: "sentiment",
        fnDescription: "Write the sentiment analysis",
      })
      .withInstructionPrompt(),

    new ZodSchema(
      z.object({
        sentiment: z
          .enum(["positive", "neutral", "negative"])
          .describe("Sentiment."),
      })
    ),

    {
      system:
        "You are a sentiment evaluator. " +
        "Analyze the sentiment of the following product review:",
      instruction:
        "After I opened the package, I was met by a very unpleasant smell " +
        "that did not disappear even after washing. Never again!",
    }
  );

  console.log(JSON.stringify(sentiment, null, 2));
}

main().catch(console.error);
