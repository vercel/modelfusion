---
sidebar_position: 2
title: Logging
---

# Function Logging

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/util/logging)

Logging can be helpful for debugging during development and to get basic information from the deployed application.
ModelFusion provides a logging mechanism for model-related function calls that can be configured globally or per function.

The logging mechanism covers basic logging.
If you need more advanced logging or integration into observability systems, please check out the [function observers](/guide/util/observer) feature.

## Configuration

### Global Function Logging

You can configure the logging mode globally by calling `modelfusion.setLogFormat()`.

#### Example

```ts
import { generateText, modelfusion, openai } from "modelfusion";

modelfusion.setLogFormat("basic-text");

const text = await generateText(
  openai.CompletionTextGenerator({ model: "gpt-3.5-turbo-instruct" }),
  "Write a short story about a robot learning to love:\n\n"
);
```

### Per Function Logging

You can configure the logging mode per function by setting the `logging` property of the function options.

#### Example

```ts
const text = await generateText(
  openai.CompletionTextGenerator({ model: "gpt-3.5-turbo-instruct" }),
  "Write a short story about a robot learning to love:\n\n",
  { logging: "basic-text" }
);
```

The per function logging mode takes precedence over the global function logging mode.

#### Example

```ts
import { generateText, modelfusion, openai } from "modelfusion";

modelfusion.setLogFormat("basic-text");

const text = await generateText(
  openai.CompletionTextGenerator({ model: "gpt-3.5-turbo-instruct" }),
  "Write a short story about a robot learning to love:\n\n",
  { logging: "off" } // overrides global logging
);
```

## Logging Modes

### basic-text

The logging mode `basic-text` logs the timestamp and the event kind to the console.
This mode is useful to see the overall progress and to setup basic logging of the deployed application.

#### Example

```ts
const text = await generateText(
  openai.CompletionTextGenerator({ model: "gpt-3.5-turbo-instruct" }),
  "Write a short story about a robot learning to love:\n\n",
  { logging: "basic-text" }
);

// [2023-08-31T13:23:10.000Z] call-rP3zt83595dU7oTureZFB - text-generation started
// [2023-08-31T13:23:10.000Z] call-rP3zt83595dU7oTureZFB - text-generation finished in 1777ms
```

### detailed-object

The logging mode `detailed-object` logs an object with all relevant properties except the original response as an object to the console.

This mode is best for debugging and to get a detailed overview of the function call locally.
The console output is colored and indented for better readability, but some details might be lost.

#### Example

```ts
const text = await generateText(
  openai.CompletionTextGenerator({ model: "gpt-3.5-turbo-instruct" }),
  "Write a short story about a robot learning to love:\n\n",
  { logging: "detailed-object" }
);

// {
//   eventType: 'started',
//   functionType: 'text-generation',
//   callId: 'call-ediZCZG0-vu0WcjYvkEF8',
//   model: { provider: 'openai', modelName: 'gpt-3.5-turbo-instruct' },
//   settings: { maxCompletionTokens: 50 },
//   input: 'Write a short story about a robot learning to love:\n\n',
//   timestamp: 2023-08-31T13:29:20.000Z,
//   startTimestamp: 2023-08-31T13:29:20.000Z
// }
// {
//   eventType: 'finished',
//   functionType: 'text-generation',
//   callId: 'call-ediZCZG0-vu0WcjYvkEF8',
//   model: { provider: 'openai', modelName: 'gpt-3.5-turbo-instruct' },
//   settings: { maxCompletionTokens: 50 },
//   input: 'Write a short story about a robot learning to love:\n\n',
//   timestamp: 2023-08-31T13:29:20.000Z,
//   startTimestamp: 2023-08-31T13:29:20.000Z,
//   finishTimestamp: 2023-08-31T13:29:21.927Z,
//   durationInMs: 1671,
//   result: {
//     status: 'success',
//     usage: { promptTokens: 12, completionTokens: 50, totalTokens: 62 },
//     output: 'Once upon a time, there was a robot named Noxon who lived all alone in a laboratory. He had never interacted with anyone before, except for the scientists who had built him. However, one day a young girl wandered into the laboratory'
//   }
// }
```

### detailed-json

The logging mode `detailed-json` logs an object with all relevant properties except the original response as a JSON string to the console.

The mode is intended for production systems with a logging and observability infrastructure that can parse JSON strings.

```ts
const text = await generateText(
  openai.CompletionTextGenerator({ model: "gpt-3.5-turbo-instruct" }),
  "Write a short story about a robot learning to love:\n\n",
  { logging: "detailed-json" }
);

// {"eventType":"started","functionType":"text-generation","callId":"call-ElLnBZhkIsObfNFpLiIct","model":{"provider":"openai","modelName":"gpt-3.5-turbo-instruct"},"settings":{"maxCompletionTokens":50},"input":"Write a short story about a robot learning to love:\n\n","timestamp":"2023-08-31T13:31:54.000Z","startTimestamp":"2023-08-31T13:31:54.000Z"}
// {"eventType":"finished","functionType":"text-generation","callId":"call-ElLnBZhkIsObfNFpLiIct","model":{"provider":"openai","modelName":"gpt-3.5-turbo-instruct"},"settings":{"maxCompletionTokens":50},"input":"Write a short story about a robot learning to love:\n\n","timestamp":"2023-08-31T13:31:54.000Z","startTimestamp":"2023-08-31T13:31:54.000Z","finishTimestamp":"2023-08-31T13:31:56.373Z","durationInMs":1890,"result":{"status":"success","usage":{"promptTokens":12,"completionTokens":50,"totalTokens":62},"output":"The robot lay in the corner of the bedroom, alone with its thoughts for the first time in what felt like an eternity. It had been activated years ago, given an array of instructions to follow, and it had done so diligently and efficiently until"}}
```

### off

The logging mode `off` disables logging. Only needed for overriding the global logging mode.
