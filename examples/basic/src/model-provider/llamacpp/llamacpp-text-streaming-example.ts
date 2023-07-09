import { LlamaCppTextGenerationModel, streamText } from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const tokenStream = await streamText(
    new LlamaCppTextGenerationModel({ nPredict: 256, temperature: 0.7 }),
    "Write a short story about a robot learning to love:\n\n"
  );

  for await (const token of tokenStream) {
    process.stdout.write(token);
  }
})();
