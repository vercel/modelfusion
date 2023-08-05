import {
  OpenAIChatFunctionPrompt,
  OpenAIChatMessage,
  OpenAIChatModel,
  Tool,
  useToolOrGenerateText,
} from "modelfusion";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const questions = [
  "A rectangular prism has a base of 124cm^2 and a height of 12cm. " +
    "What is the volume of the rectangular prism?",

  "Four friends ran a total of 26.54 miles. " +
    "The friend who ran the farthest ran 12.63 miles. " +
    "The friend who ran the shortest amount ran 3.67 miles. " +
    "If the other two friends ran the same amount, how much did each of the other friend run?",

  "Last week 24,000 fans attended a football match. " +
    "This week three times as many bought tickets, but one-sixth of them canceled their tickets. " +
    "How many are attending this week?",

  "The score of Emma was half as that of Ava and the score of Mia was twice that of Ava. " +
    "If the score of Mia was 60, what is the score of Emma?",

  "A swimming pool holds 2,000 cubic feet of water. " +
    "The swimming pool is 25 feet long and 10 feet wide. " +
    "How deep is the swimming pool?",

  "A taxi driver earns $9 per 1-hour work. " +
    "If he works 10 hours a day and in 1 hour he uses 2-liters petrol with price $1 for 1-liter. " +
    "How much money does he earn in one day?",

  "A taxi driver earns $9461 per 1-hour work. If he works 12 hours a day and in 1 hour he uses 12-liters petrol with price $134 for 1-liter. How much money does he earn in one day?",
];

const problem = questions[Math.floor(Math.random() * questions.length)];

(async () => {
  const calculator = new Tool({
    name: "calculator" as const,
    description: "Execute a calculation",

    inputSchema: z.object({
      a: z.number().describe("The first number."),
      b: z.number().describe("The second number."),
      operator: z.enum(["+", "-", "*", "/"]).describe("The operator."),
    }),

    execute: async ({ a, b, operator }) => {
      switch (operator) {
        case "+":
          return a + b;
        case "-":
          return a - b;
        case "*":
          return a * b;
        case "/":
          return a / b;
        default:
          throw new Error(`Unknown operator: ${operator}`);
      }
    },
  });

  const answer = new Tool({
    name: "answer" as const,
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
        maxTokens: 500,
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
        messages.push(
          OpenAIChatMessage.functionCall(text, {
            name: calculator.name,
            arguments: JSON.stringify(parameters),
          })
        );
        messages.push(
          OpenAIChatMessage.functionResult("calculator", result.toString())
        );
        break;
      }

      case "answer":
        console.log(`ANSWER: ${result.answer}`);
        console.log(`EXPLANATION: ${result.explanation}\n`);
        return; // exit the program
    }
  }
})();
