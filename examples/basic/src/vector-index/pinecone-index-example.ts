import { PineconeClient } from "@pinecone-database/pinecone";
import {
  CohereTextEmbeddingModel,
  PineconeVectorIndex,
  VectorDB,
} from "ai-utils.js";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;

if (!PINECONE_API_KEY || !PINECONE_ENVIRONMENT || !PINECONE_INDEX_NAME) {
  throw new Error(
    "COHERE_API_KEY, PINECONE_API_KEY, PINECONE_ENVIRONMENT and PINECONE_INDEX_NAME must be set"
  );
}

(async () => {
  const client = new PineconeClient();
  await client.init({
    apiKey: PINECONE_API_KEY,
    environment: PINECONE_ENVIRONMENT,
  });
  const index = client.Index(PINECONE_INDEX_NAME);

  const texts = [
    "A rainbow is an optical phenomenon that can occur under certain meteorological conditions.",
    "It is caused by refraction, internal reflection and dispersion of light in water droplets resulting in a continuous spectrum of light appearing in the sky.",
    "The rainbow takes the form of a multicoloured circular arc.",
    "Rainbows caused by sunlight always appear in the section of sky directly opposite the Sun.",
    "Rainbows can be full circles.",
    "However, the observer normally sees only an arc formed by illuminated droplets above the ground, and centered on a line from the Sun to the observer's eye.",
    "In a primary rainbow, the arc shows red on the outer part and violet on the inner side.",
    "This rainbow is caused by light being refracted when entering a droplet of water, then reflected inside on the back of the droplet and refracted again when leaving it.",
    "In a double rainbow, a second arc is seen outside the primary arc, and has the order of its colours reversed, with red on the inner side of the arc.",
    "This is caused by the light being reflected twice on the inside of the droplet before leaving it.`",
  ];

  const vectorDB = new VectorDB({
    index: new PineconeVectorIndex({
      index,
      schema: z.object({ text: z.string() }),
    }),
    embeddingModel: new CohereTextEmbeddingModel({
      model: "embed-english-light-v2.0",
    }),
  });

  // Note: if this script is run several times, the same texts will be inserted and there will be duplicates.
  // Note: Pinecone might need some time to index the data.
  await vectorDB.upsertMany({
    keyTexts: texts,
    data: texts.map((text) => ({ text })),
  });

  const results = await vectorDB.queryByText({
    queryText: "rainbow and water droplets",
    maxResults: 3,
  });

  console.log(results);
})();
