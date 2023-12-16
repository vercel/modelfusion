import dotenv from "dotenv";
import { OpenAIChatMessage, openai, useToolsOrGenerateText } from "modelfusion";
import { calculator } from "./CalculatorTool";
import { questions } from "./Questions";

dotenv.config();

const problem = questions[Math.floor(Math.random() * questions.length)];

async function main() {
  const messages = [
    OpenAIChatMessage.system(
      "You are solving math problems. " +
        "Reason step by step. " +
        "Use the calculator when necessary. " +
        "The calculator can only do simple additions, subtractions, multiplications, and divisions. " +
        "When you give the final answer, provide an explanation for how you got it."
    ),
    OpenAIChatMessage.user(problem),
  ];

  console.log(`PROBLEM: ${problem}\n`);

  while (true) {
    const { text, toolResults } = await useToolsOrGenerateText(
      openai.ChatTextGenerator({
        model: "gpt-4-1106-preview",
        temperature: 0,
        maxGenerationTokens: 500,
      }),
      [calculator],
      messages
    );

    // add the agent response to the messages:
    messages.push(
      OpenAIChatMessage.assistant(text, {
        toolCalls: toolResults?.map((result) => result.toolCall),
      })
    );

    if (toolResults == null) {
      console.log(`ANSWER: ${text ?? "No answer found."}`);
      console.log();

      return; // no more actions, exit the program:
    }

    if (text != null) {
      console.log(`TEXT: ${text}\n`);
    }

    for (const { tool, result, ok, args, toolCall } of toolResults ?? []) {
      // add the tool results to the messages:
      messages.push(
        OpenAIChatMessage.tool({ toolCallId: toolCall.id, content: result })
      );

      if (!ok) {
        console.log(`ERROR: ${result}\n`);
        continue;
      }

      switch (tool) {
        case "calculator": {
          console.log(
            `CALCULATION: ${args.a} ${args.operator} ${args.b} = ${result}\n`
          );
          break;
        }
      }
    }
  }
}

main().catch(console.error);
