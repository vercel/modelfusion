import { OpenAIChatMessage, OpenAIChatModel, streamText } from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const textStream = await streamText(
    new OpenAIChatModel({
      model: "gpt-3.5-turbo",
      maxCompletionTokens: 1000,
      logitBias: {
        1820: -100, // 'the'
        279: -100, // ' the'
        264: -100, // ' a'
        64: -100, // 'a'
      },
    }),
    [
      OpenAIChatMessage.system("You are a story writer. Write a story about:"),
      OpenAIChatMessage.user("A robot learning to love"),
    ]
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
}

main().catch(console.error);
