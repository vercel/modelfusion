import { Command } from "commander";
import dotenv from "dotenv";
import {
  MemoryVectorIndex,
  OpenAITextEmbeddingModel,
  upsertIntoVectorIndex,
} from "modelfusion";
import fs from "node:fs";

dotenv.config();

const program = new Command();

program
  .description("Index tweets separated by \n-----\n in an input file")
  .requiredOption("-i, --inputFile <value>", "Path to example tweets file")
  .requiredOption("-o, --outputFile <value>", "Path to output file")
  .parse(process.argv);

const { inputFile, outputFile } = program.opts();

async function main() {
  const inputText = fs.readFileSync(inputFile, "utf-8");

  const exampleTweets = inputText.split("\n-----\n");

  const vectorIndex = new MemoryVectorIndex<string>();

  await upsertIntoVectorIndex({
    vectorIndex,
    embeddingModel: new OpenAITextEmbeddingModel({
      model: "text-embedding-ada-002",
    }),
    objects: exampleTweets,
    getValueToEmbed: (tweet) => tweet,
  });

  fs.writeFileSync(outputFile, vectorIndex.serialize());
}

main().catch(console.error);
