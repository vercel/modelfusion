---
sidebar_position: 4
---

# Stream Text

Streams text that is generated using by a [TextStreamingModel](/api/interfaces/TextStreamingModel) using a prompt.

> ⚠️ Streaming is currently under development. The API is subject to change.
>
> More advanced use cases (e.g. streaming through an edge or server component) are only supported via OpenAI chat model `.callAPI` (see [AI chat with Next.js example](https://github.com/lgrammel/ai-utils.js/tree/main/examples/ai-chat-next-js)).

## Usage

### streamText

[streamText API](/api/modules#streamtext)

#### With OpenAI chat model

```ts
const tokenStream = await streamText(
  new OpenAIChatModel({ model: "gpt-3.5-turbo", maxTokens: 1000 }),
  [
    OpenAIChatMessage.system("You are a story writer. Write a story about:"),
    OpenAIChatMessage.user("A robot learning to love"),
  ]
);

for await (const token of tokenStream) {
  process.stdout.write(token);
}
```

### streamTextAsFunction

[streamTextAsFunction API](/api/modules#streamtextasfunction)

#### With OpenAI chat model

```ts
const generateStory = streamTextAsFunction(
  new OpenAIChatModel({ model: "gpt-3.5-turbo", maxTokens: 1000 }),
  async (topic: string) => [
    OpenAIChatMessage.system("You are a story writer. Write a story about:"),
    OpenAIChatMessage.user(topic),
  ]
);

const tokenStream = await generateStory("A robot learning to love");
for await (const token of tokenStream) {
  process.stdout.write(token);
}
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
- [Cohere](/integration/model-provider/cohere)
- [Llama.cpp](/integration/model-provider/llamacpp)
