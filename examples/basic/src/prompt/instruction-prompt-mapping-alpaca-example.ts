import {
  InstructionToAlpacaPromptMapping,
  LlamaCppTextGenerationModel,
  streamText,
} from "modelfusion";

(async () => {
  // example assumes you are running https://huggingface.co/TheBloke/Chronos-13B-v2-GGML with llama.cpp
  const textStream = await streamText(
    new LlamaCppTextGenerationModel({
      contextWindowSize: 2048, // context window size of Chronos-13B-v2-GGML
      nPredict: 1024,
    }).mapPrompt(InstructionToAlpacaPromptMapping()),
    {
      instruction: "You are a celebrated poet. Write a short story about:",
      input: "a robot learning to love.",
    }
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
})();
