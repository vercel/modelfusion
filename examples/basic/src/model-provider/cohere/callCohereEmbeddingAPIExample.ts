import { callCohereEmbeddingAPI } from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

const COHERE_API_KEY = process.env.COHERE_API_KEY ?? "";

(async () => {
  const response = await callCohereEmbeddingAPI({
    apiKey: COHERE_API_KEY,
    model: "embed-english-light-v2.0",
    texts: [
      "At first, Nox didn't know what to do with the pup.",
      "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
    ],
  });

  console.log(response.embeddings[0]);
})();
