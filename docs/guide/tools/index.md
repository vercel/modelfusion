---
sidebar_position: 15
---

# Tools

Tools are functions and descriptions of their parameters and purpose. They can be used by language models in prompts to execute actions. This enables chatbots and agents to go beyond generating text and to interact with the world.

ModelFusion provides several building blocks for working with tools:

### Tools

- [Tools](/guide/tools/create-tools): an interface for defining tools.
- [Predefined Tools](/guide/tools/predefined-tools): a set of predefined tools for common tasks.

### Using Tools

- [Execute Tool](/guide/tools/execute-tool): a function that executes a tool with the provided arguments.
- [Use Tool](/guide/tools/use-tool): a function that generates a single tool call and executes the tool with the generated arguments.
- [Use Tools](/guide/tools/use-tools): a function that generates mulitple tool calls and/or text from a prompt, and then executes the tools.

### Agents

- [Agent Loop](/guide/tools/agent-loop): an example of how to use the building blocks to run an agent loop that generates tool calls and text from a prompt, and then executes the tools.
