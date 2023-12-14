import dotenv from "dotenv";
import { embedMany, mistral, retryNever } from "modelfusion";

dotenv.config();

async function main() {
  const embeddings = await embedMany(
    mistral.TextEmbedder({
      model: "mistral-embed",
    }),
    [
      "At first, Nox didn't know what to do with the pup.",
      "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
    ]
  );

  console.log(embeddings);
}

main().catch(console.error);
