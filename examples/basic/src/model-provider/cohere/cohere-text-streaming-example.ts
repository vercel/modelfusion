import { CohereTextGenerationModel, streamText } from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const tokenStream = await streamText(
    new CohereTextGenerationModel({
      model: "command-nightly",
      temperature: 0.7,
      maxTokens: 500,
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  for await (const token of tokenStream) {
    process.stdout.write(token);
  }
})();
