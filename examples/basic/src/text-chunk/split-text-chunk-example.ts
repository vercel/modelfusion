import dotenv from "dotenv";
import { splitAtCharacter, splitTextChunk } from "modelfusion";
import fs from "node:fs";
import path from "node:path";

dotenv.config();

async function main() {
  const sanFranciscoWikipediaText = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../../data/san-francisco-wikipedia.json"),
      "utf8"
    )
  ).content as string;

  const chunks = await splitTextChunk(
    splitAtCharacter({ maxCharactersPerChunk: 1000 }), // split function
    {
      text: sanFranciscoWikipediaText, // text property (string) = input to split
      source: "data/san-francisco-wikipedia.json", // other properties are replicated
    }
  );

  console.log(chunks);
}

main().catch(console.error);
