import {
  Llama2InstructionPromptMapping,
  LlamaCppTextGenerationModel,
  streamText,
} from "ai-utils.js";

(async () => {
  const textStream = await streamText(
    new LlamaCppTextGenerationModel().mapPrompt(Llama2InstructionPromptMapping),
    {
      system: "You are an AI assistant.",
      instruction: "Write a story about Berlin.",
    }
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
})();
