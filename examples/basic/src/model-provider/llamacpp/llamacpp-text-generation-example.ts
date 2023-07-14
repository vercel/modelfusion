import { LlamaCppTextGenerationModel, generateText } from "ai-utils.js";

(async () => {
  const text = await generateText(
    new LlamaCppTextGenerationModel({ nPredict: 256, temperature: 0.7 }),
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
})();
