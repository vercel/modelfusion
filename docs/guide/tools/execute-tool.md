---
sidebar_position: 20
---

# Execute Tool

You can directly invoke a tool with [executeTool](/api/modules/#executetool). It enables tracing and error handling compared to calling the `execute` function of the tool directly. The result is typed.

## Example

```ts
const result = await executeTool(calculator, {
  a: 14,
  b: 12,
  operator: "*",
});
```

## Error Handling

When the tool execution fails, `executeTool` will throw a [ToolExecutionError](/api/classes/ToolExecutionError) that contains the tool name, the inputs, and the cause.
