import dotenv from "dotenv";
import { OpenAITextGenerationModel, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText(
    new OpenAITextGenerationModel({
      model: "gpt-3.5-turbo-instruct",
      temperature: 0.7,
      maxCompletionTokens: 500,
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
}

main().catch(console.error);
