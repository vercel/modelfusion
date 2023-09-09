import dotenv from "dotenv";
import {
  HeliconeOpenAIApiConfiguration,
  OpenAIChatMessage,
  OpenAIChatModel,
  streamText,
} from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText(
    new OpenAIChatModel({
      api: new HeliconeOpenAIApiConfiguration(),
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      maxCompletionTokens: 500,
    }),
    [
      OpenAIChatMessage.system(
        "Write a short story about a robot learning to love:"
      ),
    ]
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
}

main().catch(console.error);
