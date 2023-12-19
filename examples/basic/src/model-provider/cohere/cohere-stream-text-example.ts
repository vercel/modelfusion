import { cohere, streamText } from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const textStream = await streamText(
    cohere.TextGenerator({
      model: "command-nightly",
      temperature: 0.7,
      maxGenerationTokens: 500,
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
