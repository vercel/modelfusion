import dotenv from "dotenv";
import { embedMany, openai } from "modelfusion";

dotenv.config();

async function main() {
  const embeddings = await embedMany({
    model: openai.TextEmbedder({ model: "text-embedding-ada-002" }),
    values: [
      "At first, Nox didn't know what to do with the pup.",
      "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
    ],
  });

  console.log(embeddings);
}

main().catch(console.error);
