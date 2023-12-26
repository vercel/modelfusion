import { GoogleCustomSearchTool } from "@modelfusion/google-custom-search-tool";
import chalk from "chalk";
import { Command } from "commander";
import dotenv from "dotenv";
import { convert as convertHtmlToText } from "html-to-text";
import {
  ChatMessage,
  ChatPrompt,
  Tool,
  openai,
  summarizeRecursivelyWithTextGenerationAndTokenSplitting,
  useToolsOrGenerateText,
  zodSchema,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

const program = new Command();

program
  .description("Wikipedia Agent")
  .requiredOption("-q, --question <value>", "Question")
  .parse(process.argv);

const { question } = program.opts();

const searchWikipedia = new GoogleCustomSearchTool({
  name: "search_wikipedia",
  searchEngineId: "76fe2b5e95a3e4215",
  description: "Search Wikipedia pages using a query",
  maxResults: 5,
});

const readWikipediaArticle = new Tool({
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

async function main() {
  const chat: ChatPrompt = {
    system:
      "You are researching the answer to the user's question on Wikipedia. " +
      "Reason step by step. " +
      "Search Wikipedia and extract information from relevant articles as needed. " +
      "All facts for your answer must be from Wikipedia articles that you have read.",
    messages: [ChatMessage.user({ text: question })],
  };

  console.log();
  console.log(chalk.green.bold(`*****QUESTION*****`));
  console.log(`${question}`);
  console.log();

  while (true) {
    const { text, toolResults } = await useToolsOrGenerateText(
      openai
        .ChatTextGenerator({ model: "gpt-4-1106-preview", temperature: 0 })
        .withChatPrompt(),
      [searchWikipedia, readWikipediaArticle],
      chat
    );

    chat.messages.push(
      ChatMessage.assistant({ text, toolResults }),
      ChatMessage.tool({ toolResults })
    );

    if (toolResults == null) {
      console.log(chalk.green.bold(`*****ANSWER*****`));
      console.log(text ?? "No answer found.");
      console.log();

      return; // no more actions, exit the program:
    }

    if (text != null) {
      console.log(chalk.yellow.bold(`*****TEXT*****`));
      console.log(text);
      console.log();
    }

    for (const { tool, result, args, ok } of toolResults ?? []) {
      if (!ok) {
        console.log(chalk.red.bold(`*****ERROR*****`));
        console.log(result);
        console.log();

        continue;
      }

      switch (tool) {
        case "search_wikipedia": {
          console.log(chalk.yellow.bold(`*****SEARCH WIKIPEDIA*****`));
          console.log(`Query: ${args.query}`);
          console.log();

          if (text != null) {
            console.log(chalk.blueBright.bold("*****REASONING*****"));
            console.log(text);
            console.log();
          }

          console.log(chalk.blueBright.bold("*****RESULTS*****"));
          for (const entry of result.results) {
            console.log(chalk.bold(entry.title));
            console.log(entry.link);
            console.log(entry.snippet);
            console.log();
          }

          break;
        }

        case "read_wikipedia_article": {
          console.log(chalk.yellow.bold(`*****READ ARTICLE*****`));
          console.log(args.url);
          console.log(`Topic: ${args.topic}`);
          console.log();

          console.log(chalk.blueBright.bold("*****SUMMARY*****"));
          console.log(result);
          console.log();

          break;
        }
      }
    }
  }
}

main().catch(console.error);
