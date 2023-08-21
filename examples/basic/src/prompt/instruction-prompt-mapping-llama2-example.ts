import {
  Llama2InstructionPromptFormat,
  LlamaCppTextGenerationModel,
  streamText,
} from "modelfusion";

(async () => {
  // example assumes you are running https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGML with llama.cpp
  const textStream = await streamText(
    new LlamaCppTextGenerationModel({
      contextWindowSize: 4096, // Llama 2 context window size
      maxCompletionTokens: 512,
    }).withPromptFormat(Llama2InstructionPromptFormat()),
    {
      system: "You are a celebrated poet.",
      instruction: "Write a short story about a robot learning to love.",
    }
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
})();
