import dotenv from "dotenv";
import {
  OpenAIChatMessage,
  OpenAIChatModel,
  useToolsOrGenerateText,
} from "modelfusion";
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
      new OpenAIChatModel({
        model: "gpt-4-1106-preview",
        temperature: 0,
        maxCompletionTokens: 500,
      }),
      [calculator],
      messages
    );

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

    for (const { tool, result, args, toolCall } of toolResults ?? []) {
      messages.push(
        OpenAIChatMessage.tool({ toolCallId: toolCall.id, content: result })
      );

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
