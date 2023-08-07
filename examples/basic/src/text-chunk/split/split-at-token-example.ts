import { TikTokenTokenizer, splitAtToken } from "modelfusion";
import fs from "node:fs";

(async () => {
  const sanFranciscoWikipediaText = JSON.parse(
    fs.readFileSync("data/san-francisco-wikipedia.json", "utf8")
  ).content as string;

  const split = splitAtToken({
    maxTokensPerChunk: 256,
    tokenizer: new TikTokenTokenizer({ model: "gpt-4" }),
  });

  const result = await split({
    text: sanFranciscoWikipediaText,
  });

  console.log(result);
})();
