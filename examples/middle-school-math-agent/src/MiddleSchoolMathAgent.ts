import { MathJsTool } from "@modelfusion/mathjs-tool";
import dotenv from "dotenv";
import { ChatMessage, ChatPrompt, openai, useTools } from "modelfusion";
import { questions } from "./Questions";

dotenv.config();

const problem = questions[Math.floor(Math.random() * questions.length)];

async function main() {
  console.log(`PROBLEM: ${problem}\n`);

  // initial chat:
  const chat: ChatPrompt = {
    system:
      "You are solving math problems. " +
      "Reason step by step. " +
      "Use the calculator when necessary. " +
      "The calculator can only do simple additions, subtractions, multiplications, and divisions. " +
      "When you give the final answer, provide an explanation for how you got it.",
    messages: [ChatMessage.user({ text: problem })],
  };

  // agent loop:
  while (true) {
    // call the language model and execute the tools:
    const { text, toolResults } = await useTools({
      model: openai
        .ChatTextGenerator({
          model: "gpt-4-1106-preview",
          temperature: 0,
          maxGenerationTokens: 500,
        })
        .withChatPrompt(),
      tools: [new MathJsTool({ name: "calculator" })],
      prompt: chat,
    });

    // add the assistant and tool messages to the chat:
    chat.messages.push(
      ChatMessage.assistant({ text, toolResults }),
      ChatMessage.tool({ toolResults })
    );

    if (toolResults == null) {
      console.log(`ANSWER: ${text ?? "No answer found."}`);
      console.log();

      return; // no more actions, exit the program
    }

    if (text != null) {
      console.log(`TEXT: ${text}\n`);
    }

    for (const { tool, result, ok, args } of toolResults ?? []) {
      if (!ok) {
        console.log(`ERROR: ${result}\n`);
        continue;
      }

      switch (tool) {
        case "calculator": {
          console.log(`CALCULATION: ${args.expression} = ${result}\n`);
          break;
        }
      }
    }
  }
}

main().catch(console.error);
