import { createOpenAIEmbeddingModel } from "ai-utils.js/model/openai";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

(async () => {
  const textModel = createOpenAIEmbeddingModel({
    apiKey: OPENAI_API_KEY,
    model: "text-embedding-ada-002",
  });

  const response = await textModel.embed(
    "At first, Nox didn't know what to do with the pup."
  );

  const embedding = await textModel.extractEmbedding(response);

  console.log(embedding);
})();
