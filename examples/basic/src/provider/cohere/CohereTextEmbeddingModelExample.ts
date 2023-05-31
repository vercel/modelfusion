import { CohereTextEmbeddingModel } from "ai-utils.js/provider/cohere";
import dotenv from "dotenv";

dotenv.config();

const COHERE_API_KEY = process.env.COHERE_API_KEY ?? "";

(async () => {
  const embeddingModel = new CohereTextEmbeddingModel({
    apiKey: COHERE_API_KEY,
    model: "embed-english-light-v2.0",
  });

  const response = await embeddingModel.embed([
    "At first, Nox didn't know what to do with the pup.",
    "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
  ]);

  const embeddings = await embeddingModel.extractEmbeddings(response);

  console.log(embeddings);
})();
