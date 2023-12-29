---
sidebar_position: 5
title: Math.js
---

# Math.js Tool

[Math.js](https://mathjs.org) is a JavaScript library for evaluating mathematical expressions.

## Usage

```ts
import { MathJsTool } from "@modelfusion/mathjs-tool";

const mathTool = new MathJsTool({
  name: "math",
});
```

You can then use the tool with `useTool` or `executeTool`:

```ts
const result = await executeTool(mathTool, {
  expression: "2 + 2",
});
```
