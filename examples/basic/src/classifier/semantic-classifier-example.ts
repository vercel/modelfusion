import dotenv from "dotenv";
import { SemanticClassifier, openai } from "modelfusion";

dotenv.config();

async function main() {
  const classifier = new SemanticClassifier({
    embeddingModel: openai.TextEmbedder({
      model: "text-embedding-ada-002",
    }),
    similarityThreshold: 0.82,
    clusters: [
      {
        name: "politics" as const,
        values: [
          "isn't politics the best thing ever",
          "why don't you tell me about your political opinions",
          "don't you just love the president",
          "don't you just hate the president",
          "they're going to destroy this country!",
          "they will save the country!",
        ],
      },
      {
        name: "chitchat" as const,
        values: [
          "how's the weather today?",
          "how are things going?",
          "lovely weather today",
          "the weather is horrendous",
          "let's go to the chippy",
        ],
      },
    ],
  });

  console.log(await classifier.classify("don't you love politics?")); // politics
  console.log(await classifier.classify("how's the weather today?")); // chitchat
  console.log(
    await classifier.classify("I'm interested in learning about llama 2")
  ); // null
}

main().catch(console.error);
