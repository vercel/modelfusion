import dotenv from "dotenv";
import { OpenAIChatResponseFormat, openai } from "modelfusion";

dotenv.config();

async function main() {
  const model = openai.ChatTextGenerator({
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    maxGenerationTokens: 500,
  });

  const deltas = await model.callAPI(
    [
      openai.ChatMessage.system("You are a story writer. Write a story about:"),
      openai.ChatMessage.user("A robot learning to love"),
    ],
    { responseFormat: OpenAIChatResponseFormat.textDeltaIterable }
  );

  for await (const delta of deltas) {
    if (delta?.type === "error") {
      throw delta.error;
    }

    process.stdout.write(delta.valueDelta);
  }
}

main().catch(console.error);
