---
sidebar_position: 25
---

# Generate Tools Calls or Text

An essential behavior of chat agents is to be able to choose from different tools or to respond to the user. The agent needs to be able to make the choice of which tools, if any, to use and how, and to generate text to respond to the user.

You can use [generateToolCallsOrText](/api/modules/#generatetoolcallsortext) for this purpose. It generates tool calls and text from a prompt. The model that you provide needs to support tool calls (e.g. OpenAI Chat).

:::note
`generateToolCallsOrText` function does not execute the tools.
It only generates the arguments for the tool calls (or a text response).
You can execute the tool with [useToolsOrGenerateText](/guide/tools/use-tools-or-generate-text) or [executeTool](/guide/tools/execute-tool).
:::

## Example

```ts
const { text, toolCalls } = await generateToolCallsOrText(
  new OpenAIChatModel({
    model: "gpt-4-1106-preview",
    maxCompletionTokens: 200,
  }),
  [
    {
      name: "getTemperature" as const, // 'as const' important for type inference
      description: "Get the temperature of a room.",
      parameters: new ZodSchema(
        z.object({
          room: z.enum(["kitchen", "bedroom", "bathroom"]),
          unit: z.enum(["Celsius", "Fahrenheit"]),
        })
      ),
    },
    {
      name: "setTemperature" as const, // 'as const' important for type inference
      description: "Set the temperature of a room.",
      parameters: new ZodSchema(
        z.object({
          room: z.enum(["kitchen", "bedroom", "bathroom"]),
          temperature: z.number(),
          unit: z.enum(["Celsius", "Fahrenheit"]),
        })
      ),
    },
  ],
  [
    OpenAIChatMessage.system("You are home automation system."),
    OpenAIChatMessage.user("Show me the kitchen temperature"),
  ]
);
```

The result contains:

- `text`: The generated text that can be used to respond to the user. Might not be present when tool calls are generated.
- `toolCalls`: The generated tool calls. Might not be present when text is generated. Each tool call contains:
  - `id`: The ID of the tool call that can be used when responding to the model with the result of the tool call.
  - `name`: The name of the tool.
  - `args`: The typed arguments for the tool call.

This can be used for accessing the tool call arguments in a type-safe way:

```ts
if (text != null) {
  console.log(`TEXT: ${text}`);
}

for (const toolCall of toolCalls ?? []) {
  console.log("tool call", toolCall);

  switch (toolCall.name) {
    case "getTemperature": {
      const { room, unit } = toolCall.args;
      console.log("getTemperature", room, unit);
      break;
    }

    case "setTemperature": {
      const { room, temperature, unit } = toolCall.args;
      console.log("setTemperature", room, temperature, unit);
      break;
    }
  }
}
```

## Available Providers

- [OpenAI](/integration/model-provider/openai) (Chat models)
