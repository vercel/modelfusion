import { GoogleCustomSearchTool } from "@modelfusion/google-custom-search-tool";
import chalk from "chalk";
import { Command } from "commander";
import dotenv from "dotenv";
import {
  OpenAIChatFunctionPrompt,
  OpenAIChatMessage,
  OpenAIChatModel,
  Tool,
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

(async () => {
  const messages = [
    OpenAIChatMessage.system(
      "You are researching the answer to the user's question on Wikipedia. " +
        "Reason step by step. " +
        "Search Wikipedia and extract information from relevent articles as needed. " +
        "When you have the final answer, use the answer function to report it back to the user."
    ),
    OpenAIChatMessage.user(question),
  ];

  console.log(chalk.green.bold(`*****QUESTION*****`));
  console.log(`${question}`);
  console.log();

  while (true) {
    const { tool, parameters, result, text } = await useToolOrGenerateText(
      new OpenAIChatModel({
        model: "gpt-4",
        temperature: 0,
        maxTokens: 1000,
      }),
      [searchWikipedia, answer],
      OpenAIChatFunctionPrompt.forToolsCurried(messages)
    );

    switch (tool) {
      case null: {
        console.log(chalk.blue.bold(`*****TEXT*****`));
        console.log(result);
        console.log();

        messages.push(OpenAIChatMessage.assistant(text));

        break;
      }

      case "search_wikipedia": {
        console.log(chalk.blue.bold(`*****SEARCH WIKIPEDIA*****`));
        console.log(`Query: ${parameters.query}`);
        console.log();

        if (text != null) {
          console.log(chalk.yellow("*****REASONING*****"));
          console.log(text);
          console.log();
        }

        console.log(chalk.yellow("*****RESULTS*****"));
        for (const entry of result.results) {
          console.log(chalk.bold(entry.title));
          console.log(chalk.blueBright(entry.link));
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

      case "answer": {
        console.log(chalk.green.bold(`*****ANSWER*****`));
        console.log(result.answer);
        console.log();

        console.log(chalk.yellow(`*****EXPLANATION*****`));
        console.log(result.explanation);
        console.log();

        return; // exit the program
      }
    }
  }
})();
