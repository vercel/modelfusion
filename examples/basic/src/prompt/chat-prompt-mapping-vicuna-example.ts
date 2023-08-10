import dotenv from "dotenv";
import {
  ChatToVicunaPromptMapping,
  LlamaCppTextGenerationModel,
  streamText,
} from "modelfusion";

dotenv.config();

(async () => {
  // example assumes you are running https://huggingface.co/TheBloke/vicuna-7B-v1.5-GGML with llama.cpp
  const textStream = await streamText(
    new LlamaCppTextGenerationModel({
      contextWindowSize: 2048, // Vicuna v1.5 context window size
      nPredict: 512,
    }).mapPrompt(ChatToVicunaPromptMapping()),
    [
      { user: "Write a short story about a robot learning to love." },
      { ai: "Once upon a time, there was a robot who learned to love." },
      { user: "That's a great start!" },
    ]
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
})();
