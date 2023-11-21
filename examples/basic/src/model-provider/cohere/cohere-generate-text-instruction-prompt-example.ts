import dotenv from "dotenv";
import { CohereTextGenerationModel, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText(
    new CohereTextGenerationModel({
      model: "command",
      maxCompletionTokens: 500,
    }).withInstructionPrompt(),
    {
      system: "You are a celebrated poet.",
      instruction: "Write a story about a robot learning to love",
    }
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
