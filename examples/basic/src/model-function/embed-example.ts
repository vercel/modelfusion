import dotenv from "dotenv";
import { embed, openai } from "modelfusion";

dotenv.config();

async function main() {
  const embedding = await embed({
    model: openai.TextEmbedder({ model: "text-embedding-3-small" }),
    value: "At first, Nox didn't know what to do with the pup.",
  });

  console.log(embedding);
}

main().catch(console.error);
