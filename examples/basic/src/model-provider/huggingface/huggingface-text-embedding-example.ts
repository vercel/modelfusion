import dotenv from "dotenv";
import { HuggingFaceTextEmbeddingModel, embedTexts } from "modelfusion";

dotenv.config();

(async () => {
  const embeddings = await embedTexts(
    new HuggingFaceTextEmbeddingModel({
      model: "intfloat/e5-base-v2",
      embeddingDimensions: 768,
    }),
    [
      "At first, Nox didn't know what to do with the pup.",
      "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
    ]
  );

  console.log(embeddings);
})();
