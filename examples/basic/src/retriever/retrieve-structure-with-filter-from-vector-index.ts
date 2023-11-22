import dotenv from "dotenv";
import {
  MemoryVectorIndex,
  VectorIndexRetriever,
  openai,
  retrieve,
  upsertIntoVectorIndex,
} from "modelfusion";

dotenv.config();

async function main() {
  const texts = [
    {
      content:
        "A rainbow is an optical phenomenon that can occur under certain meteorological conditions.",
      page: 1,
    },
    {
      content:
        "It is caused by refraction, internal reflection and dispersion of light in water droplets resulting in a continuous spectrum of light appearing in the sky.",
      page: 1,
    },
    {
      content: "The rainbow takes the form of a multicoloured circular arc.",
      page: 2,
    },
    {
      content:
        "Rainbows caused by sunlight always appear in the section of sky directly opposite the Sun.",
      page: 2,
    },
    {
      content: "Rainbows can be full circles.",
      page: 3,
    },
    {
      content:
        "However, the observer normally sees only an arc formed by illuminated droplets above the ground, and centered on a line from the Sun to the observer's eye.",
      page: 3,
    },
    {
      content:
        "In a primary rainbow, the arc shows red on the outer part and violet on the inner side.",
      page: 3,
    },
    {
      content:
        "This rainbow is caused by light being refracted when entering a droplet of water, then reflected inside on the back of the droplet and refracted again when leaving it.",
      page: 2,
    },
    {
      content:
        "In a double rainbow, a second arc is seen outside the primary arc, and has the order of its colours reversed, with red on the inner side of the arc.",
      page: 2,
    },
    {
      content:
        "This is caused by the light being reflected twice on the inside of the droplet before leaving it.",
      page: 1,
    },
  ];

  const vectorIndex = new MemoryVectorIndex<{
    content: string;
    page: number;
  }>();

  await upsertIntoVectorIndex({
    vectorIndex,
    embeddingModel: openai.TextEmbedder({
      model: "text-embedding-ada-002",
    }),
    objects: texts,
    getValueToEmbed: (text) => text.content,
  });

  const result = await retrieve(
    new VectorIndexRetriever({
      vectorIndex,
      embeddingModel: openai.TextEmbedder({
        model: "text-embedding-ada-002",
      }),
      filter: (object) => object.page === 3, // <--- filter
      maxResults: 1,
      similarityThreshold: 0.8,
    }),
    "rainbow and water droplets"
    // alternative:
    // {
    //   settings: {
    //     filter: (object) => object.page === 3, // <--- filter
    //   },
    // }
  );

  console.log(result);
}

main().catch(console.error);
