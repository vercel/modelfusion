import { splitAtCharacter } from "modelfusion";
import fs from "node:fs";

async function main() {
  const sanFranciscoWikipediaText = JSON.parse(
    fs.readFileSync("data/san-francisco-wikipedia.json", "utf8")
  ).content as string;

  const split = splitAtCharacter({ maxCharactersPerChunk: 1000 });

  const result = await split({
    text: sanFranciscoWikipediaText,
  });

  console.log(result);
}

main().catch(console.error);
