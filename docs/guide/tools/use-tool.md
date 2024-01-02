---
sidebar_position: 20
---

# Use Tool

With [useTool](/api/modules/#usetool), you can invoke a single tool with a model prompt. The model that you provide needs to support tools calls (e.g. OpenAI Chat).

`useTool` does the following:

1. It calls `generateToolCall` to generate the arguments for the tool call using the model.
2. It calls `executeTool` to execute the tool with the arguments.
3. It handles tool execution errors and returns a safe result.

## Example: Using a Calculator

```ts
const { tool, toolCall, args, ok, result } = await useTool(
  openai.ChatTextGenerator({ model: "gpt-3.5-turbo" }),
  calculator,
  [openai.ChatMessage.user("What's fourteen times twelve?")]
);

console.log(`Tool call:`, toolCall);
console.log(`Tool:`, tool);
console.log(`Arguments:`, args);
console.log(`Ok:`, ok);
console.log(`Result:`, result);
```

The type of `result` depends on the `ok` flag and the tool. If `ok` is `true`, `result` is the typed result of the tool execution. If `ok` is `false`, `result` is a [ToolCallError](/api/classes/ToolCallError) that contains the tool call and the cause.

## Error Handling

When the tool execution fails, `useTool` will set `ok` to `false` and `result` to a [ToolCallError](/api/classes/ToolCallError) that contains the tool call and the cause.

Only error during the tool execution are caught. In particular, the following errors are not caught:

- [AbortError](/api/classes/AbortError) will not be caught, since it is used to cancel full runs.
- Tool call generation errors will not be caught.
