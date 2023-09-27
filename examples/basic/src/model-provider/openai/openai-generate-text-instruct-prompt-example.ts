import {
  OpenAITextGenerationModel,
  generateText,
  mapInstructionPromptToTextFormat,
} from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const text = await generateText(
    new OpenAITextGenerationModel({
      model: "gpt-3.5-turbo-instruct",
      temperature: 0.7,
      maxCompletionTokens: 500,
    }).withPromptFormat(mapInstructionPromptToTextFormat()),
    {
      instruction: "Write a short story about:",
      input: "a robot learning to love",
    }
  );

  console.log(text);
}

main().catch(console.error);
