import dotenv from "dotenv";
import { embed, openai } from "modelfusion";

dotenv.config();

async function main() {
  const embedding = await embed(
    openai.TextEmbedder({ model: "text-embedding-ada-002" }),
    "At first, Nox didn't know what to do with the pup."
  );

  console.log(embedding);
}

main().catch(console.error);
