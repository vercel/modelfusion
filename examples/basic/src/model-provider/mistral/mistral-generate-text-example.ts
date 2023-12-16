import dotenv from "dotenv";
import { generateText, mistral } from "modelfusion";

dotenv.config();

async function main() {
  const text = await generateText(
    mistral.TextGenerator({
      model: "mistral-medium",
      maxGenerationTokens: 120,
    }),
    [
      {
        role: "user",
        content: "Write a short story about a robot learning to love:",
      },
    ]
  );

  console.log(text);
}

main().catch(console.error);
