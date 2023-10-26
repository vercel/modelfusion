import dotenv from "dotenv";
import { OpenAITextEmbeddingModel, embed } from "modelfusion";

dotenv.config();

async function main() {
  const embedding = await embed(
    new OpenAITextEmbeddingModel({ model: "text-embedding-ada-002" }),
    "At first, Nox didn't know what to do with the pup."
  );

  console.log(embedding);
}

main().catch(console.error);
