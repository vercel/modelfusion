import dotenv from "dotenv";
import { embedMany, openai, throttleOff } from "modelfusion";

dotenv.config();

async function main() {
  const api = openai.Api({
    throttle: throttleOff(),
  });

  const embeddings = await embedMany(
    openai.TextEmbedder({
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
