import chalk from "chalk";
import { Command } from "commander";
import dotenv from "dotenv";
import { ChatMessage, ChatPrompt, openai, runTools } from "modelfusion";
import { readWikipediaArticle } from "./ReadWikipediaArticleTool";
import { searchWikipedia } from "./SearchWikipediaTool";

dotenv.config();

const program = new Command();

program
  .description("Wikipedia Agent")
  .requiredOption("-q, --question <value>", "Question")
  .parse(process.argv);

const { question } = program.opts();

async function main() {
  console.log();
  console.log(chalk.green.bold(`*****QUESTION*****`));
  console.log(`${question}`);
  console.log();

  const chat: ChatPrompt = {
    system:
      "You are researching the answer to the user's question on Wikipedia. " +
      "Reason step by step. " +
      "Search Wikipedia and extract information from relevant articles as needed. " +
      "All facts for your answer must be from Wikipedia articles that you have read.",
    messages: [ChatMessage.user({ text: question })],
  };

  while (true) {
    const { text, toolResults } = await runTools({
      model: openai
        .ChatTextGenerator({ model: "gpt-4-1106-preview", temperature: 0 })
        .withChatPrompt(),
      tools: [searchWikipedia, readWikipediaArticle],
      prompt: chat,
    });

    // add the assistant and tool messages to the chat:
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
