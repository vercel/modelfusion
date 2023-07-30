import {
  Llama2InstructionPromptMapping,
  LlamaCppTextGenerationModel,
  streamText,
} from "ai-utils.js";

(async () => {
  const textStream = await streamText(
    new LlamaCppTextGenerationModel().mapPrompt(
      Llama2InstructionPromptMapping()
    ),
    {
      system: "You are a celebrated poet.",
      instruction: "Write a short story about a robot learning to love.",
    }
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
})();
