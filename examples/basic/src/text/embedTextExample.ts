import { createOpenAITextEmbeddingModel } from "ai-utils.js/provider/openai";
import { embedText } from "ai-utils.js/text";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

(async () => {
  const model = createOpenAITextEmbeddingModel({
    apiKey: OPENAI_API_KEY,
    model: "text-embedding-ada-002",
  });

  const embeddings = await embedText({
    model,
    texts: [
      "At first, Nox didn't know what to do with the pup.",
      "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
    ],
  });

  console.log(embeddings);
})();
