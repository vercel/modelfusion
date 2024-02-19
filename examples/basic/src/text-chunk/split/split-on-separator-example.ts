import { splitOnSeparator } from "modelfusion";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const sanFranciscoWikipediaText = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../../../data/san-francisco-wikipedia.json"),
      "utf8"
    )
  ).content as string;

  const split = splitOnSeparator({ separator: "\n" });

  const result = await split({
    text: sanFranciscoWikipediaText,
  });

  console.log(result);
}

main().catch(console.error);
