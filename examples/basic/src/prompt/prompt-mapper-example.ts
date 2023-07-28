import {
  LlamaCppTextGenerationModel,
  llamaInstructionMapper,
  streamText,
} from "ai-utils.js";

(async () => {
  const textStream = await streamText(
    new LlamaCppTextGenerationModel({
      stop: llamaInstructionMapper.stopTokens,
    }),
    llamaInstructionMapper.map({
      system:
        "You are an AI assistant. Follow the user's instructions carefully",
      instruction: "Write a story about Berlin.",
    })
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
})();
