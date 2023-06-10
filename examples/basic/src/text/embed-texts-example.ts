import { OpenAITextEmbeddingModel } from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const model = new OpenAITextEmbeddingModel({
    model: "text-embedding-ada-002",
  });

  const embeddings = await model.embedTexts([
    "At first, Nox didn't know what to do with the pup.",
    "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
  ]);

  console.log(embeddings);
})();
