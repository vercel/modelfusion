import dotenv from "dotenv";
import { AnthropicTextGenerationModel, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText(
    new AnthropicTextGenerationModel({
      model: "claude-instant-1",
      temperature: 0.7,
      maxCompletionTokens: 500,
    }).withTextPrompt(),
    "Write a short story about a robot learning to love"
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
