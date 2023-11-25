import { openai, splitAtToken } from "modelfusion";
import fs from "node:fs";

async function main() {
  const sanFranciscoWikipediaText = JSON.parse(
    fs.readFileSync("data/san-francisco-wikipedia.json", "utf8")
  ).content as string;

  const split = splitAtToken({
    maxTokensPerChunk: 256,
    // You can get a tokenizer from a model or create it explicitly.
    // The tokenizer must support getting the text for a single token.
    tokenizer: openai.Tokenizer({ model: "gpt-4" }),
  });

  const result = await split({
    text: sanFranciscoWikipediaText,
  });

  console.log(result);
}

main().catch(console.error);
