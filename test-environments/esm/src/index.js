import dotenv from "dotenv";
import { OpenAICompletionModel, streamText } from "modelfusion";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

(async () => {
  const textGenerationModel = new OpenAICompletionModel({
    apiKey: OPENAI_API_KEY,
    model: "gpt-3.5-turbo-instruct",
    settings: { temperature: 0.7 },
  });

  const textStream = await streamText(
    textGenerationModel.withSettings({ maxCompletionTokens: 500 }),
    "Write a short story about a robot learning to love:\n\n"
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
})();
