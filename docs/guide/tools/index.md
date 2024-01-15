---
sidebar_position: 15
---

# Tools

Tools are functions and descriptions of their parameters and purpose. They can be used by language models in prompts to execute actions. This enables chatbots and agents to go beyond generating text and to interact with the world.

ModelFusion comes with two main functions for invoking tools:

- [Use Tool](/guide/tools/run-tool): a function that generates a single tool call and executes the tool with the generated arguments.
- [Use Tools](/guide/tools/run-tools): a function that generates multiple tool calls and/or text from a prompt, and then executes the tools.

ModelFusion also provides several tools as standalone packages. You can also create your own tools:

- [Available Tools](/guide/tools/available-tools): a set of predefined tools for common tasks.
- [Custom Tools](/guide/tools/custom-tools): a guide on how to create your own tools.

You can use tools inside an agent loop:

- [Agent Loop](/guide/tools/agent-loop): an example of how to use the building blocks to run an agent loop that generates tool calls and text from a prompt, and then executes the tools.

Finally, ModelFusion offers some advanced functions for using tools:

- [Execute Tool](/guide/tools/advanced/execute-tool): a function that executes a tool with the provided arguments.
- [Generate Tool Call](/guide/tools/advanced/generate-tool-call): a function that generates a tool call for a specific tool from a prompt.
- [Generate Tool Calls](/guide/tools/advanced/generate-tool-calls): a function that generates a set of tool calls and text from a prompt. This is useful for chat agents that need to decide whether to use tools or to generate text.
