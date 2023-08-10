import { OpenAITextGenerationModel, streamText } from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const textStream = await streamText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      maxTokens: 1000,
    }),
    "You are a story writer. Write a story about a robot learning to love"
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
})();
