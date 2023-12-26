import { convert as convertHtmlToText } from "html-to-text";
import {
  Tool,
  openai,
  summarizeRecursivelyWithTextGenerationAndTokenSplitting,
  zodSchema,
} from "modelfusion";
import { z } from "zod";

export const readWikipediaArticle = new Tool({
  name: "read_wikipedia_article",
  description:
    "Read a Wikipedia article and scan it for information on a topic",
  parameters: zodSchema(
    z.object({
      url: z.string().url().describe("The URL of the Wikipedia article."),
      topic: z.string().describe("The topic to look for in the article."),
    })
  ),
  execute: async ({ url, topic }) => {
    // fetch the article html:
    const response = await fetch(url);
    const html = await response.text();

    // convert to plain text:
    const text = convertHtmlToText(html).replace(/\[.*?\]/g, ""); // remove all links in square brackets

    // extract the topic from the text:
    return await summarizeRecursivelyWithTextGenerationAndTokenSplitting({
      model: openai
        .ChatTextGenerator({
          model: "gpt-3.5-turbo-16k",
          temperature: 0,
        })
        .withInstructionPrompt(),
      text,
      prompt: async ({ text }) => ({
        system: [
          `Extract and keep all the information about ${topic} from the following text.`,
          `Only include information that is directly relevant for ${topic}.`,
        ].join("\n"),
        instruction: text,
      }),
    });
  },
});
