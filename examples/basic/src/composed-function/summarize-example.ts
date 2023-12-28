import dotenv from "dotenv";
import { openai } from "modelfusion";
import { summarizeRecursivelyWithTextGenerationAndTokenSplitting } from "modelfusion-experimental";
import fs from "node:fs";

dotenv.config();

const summarize = ({ text }: { text: string }) =>
  summarizeRecursivelyWithTextGenerationAndTokenSplitting({
    model: openai.ChatTextGenerator({ model: "gpt-3.5-turbo" }),
    text,
    prompt: async ({ text }) => [
      openai.ChatMessage.system("Summarize the following text:"),
      openai.ChatMessage.user(text),
    ],
  });

async function main() {
  const sanFranciscoWikipedia = JSON.parse(
    fs.readFileSync("data/san-francisco-wikipedia.json", "utf8")
  ).content;

  const summary = await summarize({
    text: sanFranciscoWikipedia,
  });

  console.log(summary);
}

main().catch(console.error);
