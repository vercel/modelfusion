import dotenv from "dotenv";
import { cohere, generateText } from "modelfusion";

dotenv.config();

async function main() {
  const { text, finishReason } = await generateText({
    model: cohere.TextGenerator({
      model: "command",
      temperature: 0.7,
      maxGenerationTokens: 200,
    }),
    prompt: "Write a short story about a robot learning to love:\n\n",
    fullResponse: true,
  });

  console.log(text);
  console.log();
  console.log("Finish reason:", finishReason);
}

main().catch(console.error);
