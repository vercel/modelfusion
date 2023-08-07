import dotenv from "dotenv";
import { splitAtCharacter, splitTextChunk } from "modelfusion";
import fs from "node:fs";

dotenv.config();

(async () => {
  const sanFranciscoWikipediaText = JSON.parse(
    fs.readFileSync("data/san-francisco-wikipedia.json", "utf8")
  ).content as string;

  const chunks = await splitTextChunk(
    splitAtCharacter({ maxCharactersPerChunk: 1000 }), // split function
    {
      text: sanFranciscoWikipediaText, // text property (string) = input to split
      source: "data/san-francisco-wikipedia.json", // other properties are replicated
    }
  );

  console.log(chunks);
})();
