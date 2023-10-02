import {
  OpenAIApiConfiguration,
  OpenAITextEmbeddingModel,
  embedMany,
  throttleMaxConcurrency,
} from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const api = new OpenAIApiConfiguration({
    throttle: throttleMaxConcurrency({ maxConcurrentCalls: 10 }),
  });

  const embeddings = await embedMany(
    new OpenAITextEmbeddingModel({
      api,
      model: "text-embedding-ada-002",
    }),
    [
      "At first, Nox didn't know what to do with the pup.",
      "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
    ]
  );

  console.log(embeddings);
}

main().catch(console.error);
