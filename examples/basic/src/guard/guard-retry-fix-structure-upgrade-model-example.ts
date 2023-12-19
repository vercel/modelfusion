import dotenv from "dotenv";
import {
  OpenAIChatModelType,
  TextInstructionPrompt,
  fixStructure,
  generateStructure,
  guard,
  modelfusion,
  openai,
  zodSchema,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

modelfusion.setLogFormat("detailed-object");

async function main() {
  const sentiment = await guard(
    (
      input: { model: OpenAIChatModelType; prompt: TextInstructionPrompt },
      options
    ) =>
      generateStructure(
        openai
          .ChatTextGenerator({
            model: input.model,
            temperature: 0,
            maxGenerationTokens: 50,
          })
          .asFunctionCallStructureGenerationModel({
            fnName: "sentiment",
            fnDescription: "Write the sentiment analysis",
          })
          .withInstructionPrompt(),

        zodSchema(
          z.object({
            sentiment: z
              .enum(["positivee", "neutra", "negaaa"])
              .describe("Sentiment."),
          })
        ),
        input.prompt,
        options
      ),
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
