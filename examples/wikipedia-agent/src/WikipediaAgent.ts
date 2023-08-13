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
import chalk from "chalk";

dotenv.config();

const program = new Command();

program
  .description("Wikipedia Agent")
  .requiredOption("-q, --question <value>", "Question")
  .parse(process.argv);

const { question } = program.opts();

const answer = new Tool({
  name: "answer" as const,
  description: "Provide the final answer to the question",

  inputSchema: z.object({
    explanation: z.string().describe("The explanation of the answer."),
    answer: z.string().describe("The answer to the question"),
  }),

  execute: async (result) => result,
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
      [answer],
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

      case "answer": {
        console.log(chalk.green.bold(`*****ANSWER*****`));
        console.log(result.answer);
        console.log();

        console.log(chalk.yellow.bold(`*****EXPLANATION*****`));
        console.log(result.explanation);
        console.log();

        return; // exit the program
      }
    }
  }
})();
