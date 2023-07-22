---
sidebar_position: 15
---

# Tools

Tools are functions with a description and a defined input schema.
Language models can be instructed to use tools by selecting a tool and generating parameters for it.

The tool description and the text description in the zod schema (as well as the names in the schema) are used as part of the prompt.
Relevant names and descriptions can help the language model to understand the schema and enter the correct data.

## Creating Tools

### Tool class

[Tool API](/api/classes/Tool)

```ts
const multiplyTool = new Tool({
  name: "multiply" as const, // mark 'as const' for type inference
  description: "Multiply two numbers",

  // Zod schema for the input parameters.
  // The description becomes a part of the prompt.
  inputSchema: z.object({
    a: z.number().describe("The first number."),
    b: z.number().describe("The second number."),
  }),

  execute: async ({ a, b }) => a * b,
});
```

## Using Tools

### callTool

[callTool API](/api/modules/#calltool)

`callTool` uses [generateJson](/guide/function/generate-json) to generate parameters for a tool and executes it.
The result is typed based on the tool's output type.

```ts
const result = await callTool(
  new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
  multiplyTool,
  OpenAIChatFunctionPrompt.forToolCurried([
    OpenAIChatMessage.user("What's fourteen to the power of two?"),
  ])
);
```

### callToolOrGenerateText

[callToolOrGenerateText API](/api/modules/#calltoolorgeneratetext)

`callToolOrGenerateText` uses [generateJsonOrText](/guide/function/generate-json-or-text)
to select a tool, generate parameters for it and execute it.
It can be configured with several tools.
As a fallback, it generates text.

```ts
const { tool, result } = await callToolOrGenerateText(
  new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
  [multiplyTool, addTool],
  OpenAIChatFunctionPrompt.forToolsCurried([
    OpenAIChatMessage.user("What's fourteen to the power of two?"),
  ])
);
```

If you need more control of the prompt, e.g. to reduce errors, you can access the tools in the prompt generation:

```ts
const { tool, result } = await callToolOrGenerateText(
  new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
  [multiplyTool, addTool],
  // Instead of using a curried function,
  // you can also work with the tools directly:
  (tools) =>
    OpenAIChatFunctionPrompt.forTools({
      tools,
      messages: [
        OpenAIChatMessage.system(
          // Here the available tools are used to create
          // a more precise prompt that reduces errors:
          `You have ${tools.length} tools available (${tools
            .map((tool) => tool.name)
            .join(", ")}).`
        ),
        OpenAIChatMessage.user("What's fourteen to the power of two?"),
      ],
    })
);
```

When text is generated, the `tool` property of the output is `null`.
Otherwise it contains the name of the selected tool.
The type of the `result` property is the output type of the selected tool.

```ts
console.log(tool != null ? `TOOL: ${tool}` : "TEXT");
console.log(JSON.stringify(result, null, 2));
```
