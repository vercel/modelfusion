import {
  OpenAIChatFunctionPrompt,
  OpenAIChatMessage,
  OpenAIChatModel,
  generateJson,
} from "ai-utils.js";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

(async () => {
  const { sentiment } = await generateJson(
    new OpenAIChatModel({
      model: "gpt-3.5-turbo",
      temperature: 0,
      maxTokens: 50,
    }),
    {
      name: "sentiment",
      description: "Write the sentiment analysis",
      schema: z.object({
        sentiment: z
          .enum(["positive", "neutral", "negative"])
          .describe("Sentiment."),
      }),
    },
    OpenAIChatFunctionPrompt.forSchemaCurried([
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
})();
