import dotenv from "dotenv";
import { generateText, huggingface } from "modelfusion";

dotenv.config();

async function main() {
  const text = await generateText(
    huggingface.TextGenerator({
      model: "tiiuae/falcon-7b",
      temperature: 700,
      maxGenerationTokens: 500,
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
}

main().catch(console.error);
