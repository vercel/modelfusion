import dotenv from "dotenv";
import {
  InstructionPrompt,
  OpenAIChatModelType,
  generateObject,
  modelfusion,
  openai,
  zodSchema,
} from "modelfusion";
import { fixObject, guard } from "modelfusion-experimental";
import { z } from "zod";

dotenv.config();

modelfusion.setLogFormat("detailed-object");

async function main() {
  const sentiment = await guard(
    (
      {
        model,
        prompt,
      }: { model: OpenAIChatModelType; prompt: InstructionPrompt },
      options
    ) =>
      generateObject({
        model: openai
          .ChatTextGenerator({
            model,
            temperature: 0,
            maxGenerationTokens: 50,
          })
          .asFunctionCallObjectGenerationModel({
            fnName: "sentiment",
            fnDescription: "Write the sentiment analysis",
          })
          .withInstructionPrompt(),

        schema: zodSchema(
          z.object({
            sentiment: z
              .enum(["positivee", "neutra", "negaaa"])
              .describe("Sentiment."),
          })
        ),
        prompt,
        ...options,
      }),
    {
      model: "gpt-3.5-turbo",
      prompt: {
        system:
          "You are a sentiment evaluator. " +
          "Analyze the sentiment of the following product review:",
        instruction:
          "After I opened the package, I was met by a very unpleasant smell " +
          "that did not disappear even after washing. Never again!",
      },
    },
    fixObject({
      modifyInputForRetry: async ({ input, error }) => ({
        model: "gpt-4" as const,
        prompt: input.prompt,
      }),
    })
  );

  console.log(JSON.stringify(sentiment, null, 2));
}

main().catch(console.error);
