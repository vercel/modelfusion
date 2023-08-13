import { GoogleCustomSearchTool } from "@modelfusion/google-custom-search-tool";
import chalk from "chalk";
import { Command } from "commander";
import dotenv from "dotenv";
import { convert as convertHtmlToText } from "html-to-text";
import {
  OpenAIChatFunctionPrompt,
  OpenAIChatMessage,
  OpenAIChatModel,
  Tool,
  summarizeRecursivelyWithTextGenerationAndTokenSplitting,
  useToolOrGenerateText,
} from "modelfusion";
import { z } from "zod";

dotenv.config();

const program = new Command();

program
  .description("Wikipedia Agent")
  .requiredOption("-q, --question <value>", "Question")
  .parse(process.argv);

const { question } = program.opts();

const answer = new Tool({
  name: "answer",
  description: "Provide the final answer to the question",

  inputSchema: z.object({
    explanation: z.string().describe("The explanation of the answer."),
    answer: z.string().describe("The answer to the question"),
  }),

  execute: async (result) => result,
});

const searchWikipedia = new GoogleCustomSearchTool("search_wikipedia", {
  description: "Search Wikipedia pages using a query",
  maxResults: 5,
});

const readWikipediaArticle = new Tool({
  name: "read_wikipedia_article",
  description:
    "Read a Wikipedia article and scan it for information on a topic",
  inputSchema: z.object({
    url: z.string().url().describe("The URL of the Wikipedia article."),
    topic: z.string().describe("The topic to look for in the article."),
  }),
  execute: async ({ url, topic }) => {
    // fetch the article html:
    const response = await fetch(url);
    const html = await response.text();

    // convert to plain text:
    const text = convertHtmlToText(html).replace(/\[.*?\]/g, ""); // remove all links in square brackets

    // extract the topic from the text:
    return await summarizeRecursivelyWithTextGenerationAndTokenSplitting({
      model: new OpenAIChatModel({
        model: "gpt-3.5-turbo-16k",
        temperature: 0,
      }),
      text,
      prompt: async ({ text }) => [
        OpenAIChatMessage.system(
          [
            `Extract and keep all the information about ${topic} from the following text.`,
            `Only include information that is directly relevant for ${topic}.`,
          ].join("\n")
        ),
        OpenAIChatMessage.user(text),
      ],
    });
  },
});

(async () => {
  const messages = [
    OpenAIChatMessage.system(
      "You are researching the answer to the user's question on Wikipedia. " +
        "Reason step by step. " +
        "Search Wikipedia and extract information from relevent articles as needed. " +
        "All facts for your answer must be from Wikipedia articles that you have read. " +
        "When you have the final answer, use the answer function to report it back to the user."
    ),
    OpenAIChatMessage.user(question),
  ];

  console.log(chalk.green.bold(`*****QUESTION*****`));
  console.log(`${question}`);
  console.log();

  while (true) {
    const { tool, parameters, result, text } = await useToolOrGenerateText(
      new OpenAIChatModel({ model: "gpt-4", temperature: 0 }),
      [searchWikipedia, readWikipediaArticle, answer],
      OpenAIChatFunctionPrompt.forToolsCurried(messages)
    );

    switch (tool) {
      case null: {
        console.log(chalk.yellow.bold(`*****TEXT*****`));
        console.log(result);
        console.log();

        messages.push(OpenAIChatMessage.assistant(text));

        break;
      }

      case "search_wikipedia": {
        console.log(chalk.yellow.bold(`*****SEARCH WIKIPEDIA*****`));
        console.log(`Query: ${parameters.query}`);
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

        messages.push(
          OpenAIChatMessage.functionCall(text, {
            name: tool,
            arguments: JSON.stringify(parameters),
          })
        );
        messages.push(
          OpenAIChatMessage.functionResult(tool, result.toString())
        );
        break;
      }

      case "read_wikipedia_article": {
        console.log(chalk.yellow.bold(`*****READ ARTICLE*****`));
        console.log(parameters.url);
        console.log(`Topic: ${parameters.topic}`);
        console.log();

        console.log(chalk.blueBright.bold("*****SUMMARY*****"));
        console.log(result);
        console.log();

        messages.push(
          OpenAIChatMessage.functionCall(text, {
            name: tool,
            arguments: JSON.stringify(parameters),
          })
        );
        messages.push(
          OpenAIChatMessage.functionResult(tool, result.toString())
        );
        break;
      }

      case "answer": {
        console.log(chalk.green.bold(`*****ANSWER*****`));
        console.log(result.answer);
        console.log();

        console.log(chalk.green(`*****EXPLANATION*****`));
        console.log(result.explanation);
        console.log();

        return; // exit the program
      }
    }
  }
})();
