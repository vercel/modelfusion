import dotenv from "dotenv";
import {
  OpenAIChatMessage,
  OpenAIChatModelType,
  ZodStructureDefinition,
  fixStructure,
  generateStructure,
  guard,
  openai,
  setGlobalFunctionLogging,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

setGlobalFunctionLogging("detailed-object");

async function main() {
  const sentiment = await guard(
    (
      input: { model: OpenAIChatModelType; prompt: OpenAIChatMessage[] },
      options
    ) =>
      generateStructure(
        openai.ChatTextGenerator({
          model: input.model,
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
        input.prompt,
        options
      ),
    {
      model: "gpt-3.5-turbo",
      prompt: [
        OpenAIChatMessage.system(
          "You are a sentiment evaluator. " +
            "Analyze the sentiment of the following product review:"
        ),
        OpenAIChatMessage.user(
          "After I opened the package, I was met by a very unpleasant smell " +
            "that did not disappear even after washing. Never again!"
        ),
      ],
    },
    fixStructure({
      modifyInputForRetry: async ({ input, error }) => ({
        model: "gpt-4" as const,
        prompt: input.prompt,
      }),
    })
  );

  console.log(JSON.stringify(sentiment, null, 2));
}

main().catch(console.error);
