---
sidebar_position: 20
---

# Generate Tool Call

You can translate a prompt into arguments for a single tool call with [generateToolCall](/api/modules/#generatetoolcall). The model that you provide needs to support tools calls (e.g. OpenAI Chat).

:::note
`generateToolCall` function does not execute the tool.
It only generates the arguments for the tool call.
You can execute the tool with [useTool](/guide/tools/use-tool) or [executeTool](/guide/tools/advanced/execute-tool).
:::

## Example

```ts
const { id, name, args } = await generateToolCall(
  openai.ChatTextGenerator({ model: "gpt-3.5-turbo" }),
  calculator,
  [openai.ChatMessage.user("What's fourteen times twelve?")]
);

console.log(`Tool ID: ${id}`);
console.log(`Tool name: ${name}`);
console.log(`Tool arguments: ${JSON.stringify(args, null, 2)}`);
```

## Available Providers

- [OpenAI](/integration/model-provider/openai) (Chat models)
