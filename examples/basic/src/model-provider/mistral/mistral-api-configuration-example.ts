import dotenv from "dotenv";
import { mistral, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText(
    mistral.ChatTextGenerator({
      api: mistral.Api({
        apiKey: process.env.MISTRAL_API_KEY,
      }),
      model: "mistral-medium",
    }),
    [
      {
        role: "user",
        content: "Write a short story about a robot learning to love:",
      },
    ]
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
