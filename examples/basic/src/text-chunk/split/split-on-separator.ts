import { splitOnSeparator } from "modelfusion";
import fs from "node:fs";

(async () => {
  const sanFranciscoWikipediaText = JSON.parse(
    fs.readFileSync("data/san-francisco-wikipedia.json", "utf8")
  ).content as string;

  const split = splitOnSeparator({ separator: "\n" });
  const result = await split({
    text: sanFranciscoWikipediaText,
  });

  console.log(result);
})();
