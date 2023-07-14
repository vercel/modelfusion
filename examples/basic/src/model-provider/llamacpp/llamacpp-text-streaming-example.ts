import { LlamaCppTextGenerationModel, streamText } from "ai-utils.js";

(async () => {
  const textStream = await streamText(
    new LlamaCppTextGenerationModel({ nPredict: 1024, temperature: 0.7 }),
    "Write a short story about a robot learning to love:\n\n"
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
})();
