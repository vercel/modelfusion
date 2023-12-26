# Middle school math agent

> _terminal app_, _ReAct agent_, _tools_, _GPT-4_

Agent that solves middle school math problems. It uses a calculator tool.

Note: GPT-4 can solve these problems without a calculator. This example is just to show how to use tools in an agent.

## Usage

1. Create .env file with the following content:

```
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

2. Setup:

```sh
pnpm install
```

3. Run:

```sh
pnpm tsx src/MiddleSchoolMathAgent.ts
```
