import dotenv from "dotenv";
import { openai, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText(
    openai.ChatTextGenerator({
      model: "ft:gpt-3.5-turbo-0613:COMPANY_ID::IDSTRING", // You need to provide your own fine-tuned model here
      maxGenerationTokens: 1000,
    }),
    [
      // Adjust the prompt below to fit your fine-tuned model:
      openai.ChatMessage.system(
        "You are a joke tweeter. The user provides you with a topic and you write a tweet with a joke about that topic."
      ),
      openai.ChatMessage.user("Tesla cars"),
    ]
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
