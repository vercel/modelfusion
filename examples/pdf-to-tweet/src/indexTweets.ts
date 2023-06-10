import { MemoryStore, OpenAITextEmbeddingModel, VectorDB } from "ai-utils.js";
import { Command } from "commander";
import dotenv from "dotenv";
import fs from "node:fs";

dotenv.config();

const program = new Command();

program
  .description("Index tweets separated by \n-----\n in an input file")
  .requiredOption("-i, --inputFile <value>", "Path to example tweets file")
  .requiredOption("-o, --outputFile <value>", "Path to output file")
  .parse(process.argv);

const { inputFile, outputFile } = program.opts();

const openAiApiKey = process.env.OPENAI_API_KEY;

if (!openAiApiKey) {
  throw new Error("OPENAI_API_KEY is not set");
}

(async () => {
  const inputText = fs.readFileSync(inputFile, "utf-8");

  const exampleTweets = inputText.split("\n-----\n");

  const vectorDB = new VectorDB({
    store: new MemoryStore(),
    embeddingModel: new OpenAITextEmbeddingModel({
      apiKey: openAiApiKey,
      model: "text-embedding-ada-002",
    }),
  });

  await vectorDB.upsertMany({
    keyTexts: exampleTweets,
    data: exampleTweets.map((tweet) => ({ tweet })),
  });

  fs.writeFileSync(outputFile, vectorDB.store.serialize());
})();
