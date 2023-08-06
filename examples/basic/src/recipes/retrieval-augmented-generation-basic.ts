import {
  MemoryVectorIndex,
  OpenAIChatMessage,
  OpenAIChatModel,
  OpenAITextEmbeddingModel,
  TextChunk,
  VectorIndexSimilarTextChunkRetriever,
  generateText,
  retrieveTextChunks,
  upsertTextChunks,
} from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

const question = `What is a rainbow?`;

(async () => {
  // Ingesting information is usually done in a separate pipeline.
  // Here, we do it in the same script for simplicity:
  const vectorIndex = await ingestInformation();

  // Retrieve related information from a vector index:
  const { chunks } = await retrieveTextChunks(
    new VectorIndexSimilarTextChunkRetriever({
      // some vector index that contains the information:
      vectorIndex,
      // use the same embedding model that was used when adding information:
      embeddingModel: new OpenAITextEmbeddingModel({
        model: "text-embedding-ada-002",
      }),
      // you need to experiment with these setting for your use case:
      maxResults: 3,
      similarityThreshold: 0.8,
    }),
    question
  );

  // Generate an answer using the retrieved information:
  const { text: answer } = await generateText(
    new OpenAIChatModel({
      model: "gpt-4",
      temperature: 0, // remove randomness as much as possible
      maxTokens: 500,
    }),
    [
      OpenAIChatMessage.system(
        [
          // Instruct the model on how to answer:
          `Answer the user's question using only the provided information.`,
          // To reduce hallucination, it is important to give the model an answer
          // that it can use when the information is not sufficient:
          `If the user's question cannot be answered using the provided information, ` +
            `respond with "I don't know".`,
        ].join("\n")
      ),
      OpenAIChatMessage.user(`## QUESTION\n${question}`),
      OpenAIChatMessage.user(`## INFORMATION\n${JSON.stringify(chunks)}`),
    ]
  );

  console.log(`Question: ${question}`);
  console.log(`Answer: ${answer}`);
})();

async function ingestInformation() {
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

  const vectorIndex = new MemoryVectorIndex<TextChunk>();
  const embeddingModel = new OpenAITextEmbeddingModel({
    model: "text-embedding-ada-002",
  });

  await upsertTextChunks({
    vectorIndex,
    embeddingModel,
    chunks: texts.map((text) => ({ text })),
  });

  return vectorIndex;
}
