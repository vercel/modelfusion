import dotenv from "dotenv";
import { OpenAIChatMessage, generateText, openai } from "modelfusion";
import fs from "node:fs";

dotenv.config();

async function main() {
  function extractText({ text, topic }: { text: string; topic: string }) {
    return generateText(
      openai.ChatTextGenerator({
        model: "gpt-4",
        temperature: 0, // remove randomness as much as possible
        maxGenerationTokens: 500,
      }),
      [
        OpenAIChatMessage.system(
          [
            `## ROLE`,
            `You are an expert at extracting information.`,
            `You need to extract and keep all the information on the topic from the text below.`,
            `Only include information that is directly relevant for the topic.`,
          ].join("\n")
        ),
        OpenAIChatMessage.user(`## TOPIC\n${topic}`),
        OpenAIChatMessage.user(`## TEXT\n${text}`),
      ]
    );
  }

  const sanFranciscoWikipedia = JSON.parse(
    fs.readFileSync("data/san-francisco-wikipedia.json", "utf8")
  ).content;

  const extractedInformation = await extractText({
    text: sanFranciscoWikipedia.slice(0, 2000),
    topic: "number of residents",
  });

  console.log(extractedInformation);
}

main().catch(console.error);
