import { createOpenAITextEmbeddingModel } from "ai-utils.js/provider/openai";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

(async () => {
  const embeddingModel = createOpenAITextEmbeddingModel({
    apiKey: OPENAI_API_KEY,
    model: "text-embedding-ada-002",
  });

  const response = await embeddingModel.embed([
    "At first, Nox didn't know what to do with the pup.",
  ]);

  const embeddings = await embeddingModel.extractEmbeddings(response);

  console.log(embeddings);
})();
