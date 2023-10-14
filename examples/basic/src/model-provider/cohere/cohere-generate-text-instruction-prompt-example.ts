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
      instruction: "Write a short story about:",
      input: "a robot learning to love",
    }
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
}

main().catch(console.error);
