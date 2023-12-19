import dotenv from "dotenv";
import { cohere, generateText } from "modelfusion";

dotenv.config();

async function main() {
  const text = await generateText(
    cohere.TextGenerator({
      model: "command-nightly",
      temperature: 0.7,
      maxGenerationTokens: 500,
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
}

main().catch(console.error);
