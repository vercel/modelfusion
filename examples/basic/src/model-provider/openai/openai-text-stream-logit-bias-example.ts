import { OpenAITextGenerationModel, streamText } from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const textStream = await streamText(
    new OpenAITextGenerationModel({
      model: "gpt-3.5-turbo-instruct",
      maxCompletionTokens: 1000,
      logitBias: {
        1169: -100, // 'the'
        262: -100, // ' the'
        257: -100, // ' a'
        64: -100, // 'a'
      },
    }),
    "You are a story writer. Write a story about a robot learning to love"
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
}

main().catch(console.error);
