import {
  CohereTextGenerationModel,
  InstructionToTextPromptMapping,
  streamText,
} from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const { textStream } = await streamText(
    new CohereTextGenerationModel({
      model: "command",
      maxTokens: 500,
    }).mapPrompt(InstructionToTextPromptMapping()),
    {
      system: "You are a celebrated poet.",
      instruction: "Write a short story about a robot learning to love.",
    }
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
})();
