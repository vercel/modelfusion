import dotenv from "dotenv";
import { anthropic, generateText } from "modelfusion";

dotenv.config();

async function main() {
  const { text, finishReason } = await generateText(
    anthropic
      .TextGenerator({
        model: "claude-instant-1",
        temperature: 0.7,
        maxGenerationTokens: 200,
      })
      .withTextPrompt(),

    "Write a short story about a robot learning to love:\n\n",
    { fullResponse: true }
  );

  console.log(text);
  console.log();
  console.log("Finish reason:", finishReason);
}

main().catch(console.error);
