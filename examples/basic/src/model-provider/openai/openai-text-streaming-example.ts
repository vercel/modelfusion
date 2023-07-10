import { OpenAITextGenerationModel, streamText } from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const tokenStream = await streamText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      maxTokens: 1000,
    }),
    "You are a story writer. Write a story about a robot learning to love"
  );

  for await (const token of tokenStream) {
    process.stdout.write(token);
  }
})();
