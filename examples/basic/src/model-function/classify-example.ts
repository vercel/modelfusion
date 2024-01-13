import dotenv from "dotenv";
import { SemanticClassifier, classify, openai } from "modelfusion";

dotenv.config();

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

async function main() {
  // politics:
  console.log(
    await classify({
      model: classifier,
      value: "don't you love politics?",
    })
  );

  // chitchat:
  console.log(
    await classify({
      model: classifier,
      value: "how's the weather today?",
    })
  );

  // null (no match):
  console.log(
    await classify({
      model: classifier,
      value: "I'm interested in learning about llama 2",
    })
  );
}

main().catch(console.error);
