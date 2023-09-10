import dotenv from "dotenv";
import {
  OpenAIChatFunctionPrompt,
  OpenAIChatMessage,
  OpenAIChatModel,
  ZodFunctionDescription,
  generateJson,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

async function main() {
  const sentiment = await generateJson(
    new OpenAIChatModel({
      model: "gpt-3.5-turbo",
      temperature: 0,
      maxCompletionTokens: 50,
    }),
    new ZodFunctionDescription({
      name: "sentiment" as const,
      description: "Write the sentiment analysis",
      parameters: z.object({
        sentiment: z
          .enum(["positive", "neutral", "negative"])
          .describe("Sentiment."),
      }),
    }),
    OpenAIChatFunctionPrompt.forFunctionCurried([
      OpenAIChatMessage.system(
        "You are a sentiment evaluator. " +
          "Analyze the sentiment of the following product review:"
      ),
      OpenAIChatMessage.user(
        "After I opened the package, I was met by a very unpleasant smell " +
          "that did not disappear even after washing. Never again!"
      ),
    ])
  );

  console.log(JSON.stringify(sentiment, null, 2));
}

main().catch(console.error);
