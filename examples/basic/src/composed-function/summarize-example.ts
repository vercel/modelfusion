import {
  OpenAIChatMessage,
  OpenAIChatModel,
  summarizeRecursivelyWithTextGenerationAndTokenSplitting,
} from "modelfusion";
import dotenv from "dotenv";
import fs from "node:fs";

dotenv.config();

const summarize = ({ text }: { text: string }) =>
  summarizeRecursivelyWithTextGenerationAndTokenSplitting({
    model: new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
    text,
    prompt: async ({ text }) => [
      OpenAIChatMessage.system("Summarize the following text:"),
      OpenAIChatMessage.user(text),
    ],
    reservedCompletionTokens: 1000,
  });

(async () => {
  const sanFranciscoWikipedia = JSON.parse(
    fs.readFileSync("data/san-francisco-wikipedia.json", "utf8")
  ).content;

  const summary = await summarize({
    text: sanFranciscoWikipedia,
  });

  console.log(summary);
})();
