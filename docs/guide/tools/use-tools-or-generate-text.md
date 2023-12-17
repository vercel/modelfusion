---
sidebar_position: 45
---

# Use Tools or Generate Text

An essential behavior of chat agents is to be able to choose from different tools or to respond to the user. The agent needs to be able to make the choice of which tools, if any, to use and how, and to generate text to respond to the user.

`useToolsOrGenerateText` supports exactly this use case. It generates tool calls and text from a prompt, and then executes the tools. The model that you provide needs to support tool calls (e.g. OpenAI Chat).

`useToolsOrGenerateText` does the following:

1. It calls `generateToolCallsOrText` to generate text and multiple tool calls from a prompt.
2. It calls `executeTool` for each tool call in parallel to run the tool with the provided arguments.
3. It handles tool execution errors and returns a safe result.

## Example

```ts
const { text, toolResults } = await useToolsOrGenerateText(
  openai.ChatTextGenerator({ model: "gpt-4-1106-preview" }),
  [toolA, toolB, toolC],
  [openai.ChatMessage.user(query)]
);

if (text != null) {
  console.log(`TEXT: ${text}`);
  return;
}

for (const { tool, toolCall, args, ok, result } of toolResults ?? []) {
  console.log(`Tool call:`, toolCall);
  console.log(`Tool:`, tool);
  console.log(`Arguments:`, args);
  console.log(`Ok:`, ok);
  console.log(`Result or Error:`, result);
}
```

The type of `result` for each tool call depends on the `ok` flag and the tool. If `ok` is `true`, `result` is the typed result of the tool execution. If `ok` is `false`, `result` is a [ToolCallError](/api/classes/ToolCallError) that contains the tool call and the cause.

## Error Handling

When the tool execution fails, `useTool` will set `ok` to `false` and `result` to a [ToolCallError](/api/classes/ToolCallError) that contains the tool call and the cause.

Only error during the tool execution are caught. In particular, the following errors are not caught:

- [AbortError](/api/classes/AbortError) will not be caught, since it is used to cancel full runs.
- Tool call generation errors will not be caught.
