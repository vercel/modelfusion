import dotenv from "dotenv";
import {
  AnthropicTextGenerationModel,
  generateText,
  mapInstructionPromptToAnthropicFormat,
} from "modelfusion";

dotenv.config();

async function main() {
  const text = await generateText(
    new AnthropicTextGenerationModel({
      model: "claude-instant-1",
      temperature: 0.7,
      maxCompletionTokens: 500,
    }).withPromptFormat(mapInstructionPromptToAnthropicFormat()),
    { instruction: "Write a short story about a robot learning to love" }
  );

  console.log(text);
}

main().catch(console.error);
