# Math.js Tool for ModelFusion

[Math.js](https://mathjs.org) is a JavaScript library for evaluating mathematical expressions.

## Requirements

- [ModelFusion](https://modelfusion.dev) v0.106.0 or higher

## Usage

### Creating a SerpAPI Google Search Tool

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
