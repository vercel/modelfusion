import dotenv from "dotenv";
import {
  MemoryVectorIndex,
  OpenAITextEmbeddingModel,
  VectorIndexRetriever,
  retrieve,
  upsertIntoVectorIndex,
} from "modelfusion";

dotenv.config();

async function main() {
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

  const vectorIndex = new MemoryVectorIndex<string>();
  const embeddingModel = new OpenAITextEmbeddingModel({
    model: "text-embedding-ada-002",
  });

  await upsertIntoVectorIndex({
    vectorIndex,
    embeddingModel,
    objects: texts,
    getText: (text) => text,
  });

  const retrievedTexts = await retrieve(
    new VectorIndexRetriever({
      vectorIndex,
      embeddingModel,
      maxResults: 3,
      similarityThreshold: 0.8,
    }),
    "rainbow and water droplets"
  );

  console.log(retrievedTexts);
}

main().catch(console.error);
