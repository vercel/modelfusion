import {
  OpenAIChatFunctionPrompt,
  OpenAIChatMessage,
  OpenAIChatModel,
  Tool,
  useToolOrGenerateText,
} from "modelfusion";
import dotenv from "dotenv";
import { z } from "zod";
import { questions } from "./Questions";
import { calculator } from "./CalculatorTool";

dotenv.config();

const problem = questions[Math.floor(Math.random() * questions.length)];

async function main() {
  const answer = new Tool({
    name: "answer",
    description: "Provide the final answer to the question",

    inputSchema: z.object({
      explanation: z.string().describe("The explanation of the answer."),
      answer: z.string().describe("The answer to the question"),
    }),

    execute: async (result) => result,
  });

  const messages = [
    OpenAIChatMessage.system(
      "You are solving math problems. " +
        "Reason step by step. " +
        "Use the calculator when necessary. " +
        "The calculator can only do simple additions, subtractions, multiplications, and divisions. " +
        "When you have the final answer, use the answer function to write it down."
    ),
    OpenAIChatMessage.user(problem),
  ];

  console.log(`PROBLEM: ${problem}\n`);

  while (true) {
    const { tool, parameters, result, text } = await useToolOrGenerateText(
      new OpenAIChatModel({
        model: "gpt-4",
        temperature: 0,
        maxCompletionTokens: 500,
      }),
      [calculator, answer],
      OpenAIChatFunctionPrompt.forToolsCurried(messages)
    );

    switch (tool) {
      case null: {
        console.log(`TEXT: ${result}\n`);
        messages.push(OpenAIChatMessage.assistant(text));
        break;
      }

      case "calculator": {
        if (text != null) {
          console.log(`REASONING: ${text}`);
        }

        console.log(
          `CALCULATION: ${parameters.a} ${parameters.operator} ${parameters.b} = ${result}\n`
        );

        messages.push(OpenAIChatMessage.toolCall({ text, tool, parameters }));
        messages.push(OpenAIChatMessage.toolResult({ tool, result }));

        break;
      }

      case "answer":
        console.log(`ANSWER: ${result.answer}`);
        console.log(`EXPLANATION: ${result.explanation}\n`);
        return; // exit the program
    }
  }
}

main().catch(console.error);
