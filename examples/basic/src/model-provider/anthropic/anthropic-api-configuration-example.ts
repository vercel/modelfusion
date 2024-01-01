import dotenv from "dotenv";
import { anthropic, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText(
    anthropic.TextGenerator({
      api: anthropic.Api({
        apiKey: process.env.ANTHROPIC_API_KEY,
      }),
      model: "claude-instant-1",
    }),
    `\n\nHuman: Write a short story about a robot learning to love\n\nAssistant: `
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
