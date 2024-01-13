---
sidebar_position: 60
---

# Agent Loop

An agent loop is a loop in which the agent decides at each step which tools to use and how, and which text to generate to respond to the user. The results of the tools are being fed back to the agent in the next iteration.

You can use [useTools](/api/modules/#useTools) to implement an agent loop.

## Example: Middle School Math Agent

This example agent ([Source Code](https://github.com/lgrammel/modelfusion/tree/main/examples/middle-school-math-agent)) solves middle school math problems. It uses the [Math.js tool](/guide/tools/available-tools/mathjs) to solve the problems.

```ts
import { MathJsTool } from "@modelfusion/mathjs-tool";
import dotenv from "dotenv";
import { ChatMessage, ChatPrompt, openai, useTools } from "modelfusion";

// ...

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

  // add the result to the messages for the next iteration:
  chat.messages.push(
    ChatMessage.assistant({ text, toolResults }),
    ChatMessage.tool({ toolResults })
  );

  if (toolResults == null) {
    // no more actions, exit the program:
    return text ?? "No answer found.";
  }

  if (text != null) {
    // optionally forward the text to the user
  }

  for (const { tool, result, ok, args, toolCall } of toolResults ?? []) {
    if (!ok) {
      const error = result; // handle errors here
      continue;
    }

    // handle tool results, e.g. by forwarding them to the user:
    switch (tool) {
      case "calculator": {
        // type safe results to the arguments and the result:
        const calculation = {
          expression: args.expression,
          result,
        };
        break;
      }
    }
  }
}
```

## Demos

### Middle School Math Agent

[Source Code](https://github.com/lgrammel/modelfusion/tree/main/examples/middle-school-math-agent)

> _terminal app_, _agent_, _tools_, _GPT-4_

Small agent that solves middle school math problems. It uses a calculator tool to solve the problems.

### Wikipedia Agent

[Source Code](https://github.com/lgrammel/modelfusion/tree/main/examples/wikipedia-agent)

> _terminal app_, _ReAct agent_, _GPT-4_, _OpenAI functions_, _tools_

Get answers to questions from Wikipedia, e.g. "Who was born first, Einstein or Picasso?"
