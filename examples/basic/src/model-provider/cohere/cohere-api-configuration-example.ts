import dotenv from "dotenv";
import { cohere, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText({
    model: cohere.TextGenerator({
      api: cohere.Api({
        apiKey: process.env.COHERE_API_KEY,
      }),
      model: "command",
    }),

    prompt: "Write a short story about a robot learning to love:\n\n",
  });

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
