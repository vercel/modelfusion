import dotenv from "dotenv";
import {
  OpenAIChatMessage,
  UncheckedSchema,
  generateStructure,
  openai,
} from "modelfusion";

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
      }),
    new UncheckedSchema({
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: {
        sentiment: {
          type: "string",
          enum: ["positive", "neutral", "negative"],
          description: "Sentiment.",
        },
      },
      required: ["sentiment"],
      additionalProperties: false,
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

  console.log(JSON.stringify(sentiment, null, 2));
}

main().catch(console.error);
