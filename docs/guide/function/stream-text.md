---
sidebar_position: 4
---

# Stream Text

Streams text that is generated using by a [TextStreamingModel](/api/interfaces/TextStreamingModel) using a prompt.

## Usage

### streamText

[streamText API](/api/modules#streamtext)

#### With OpenAI chat model

```ts
const textStream = await streamText(
  new OpenAIChatModel({ model: "gpt-3.5-turbo", maxTokens: 1000 }),
  [
    OpenAIChatMessage.system("You are a story writer. Write a story about:"),
    OpenAIChatMessage.user("A robot learning to love"),
  ]
);

for await (const textFragment of textStream) {
  process.stdout.write(textFragment);
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

const textStream = await generateStory("A robot learning to love");
for await (const textFragment of textStream) {
  process.stdout.write(textFragment);
}
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
- [Cohere](/integration/model-provider/cohere)
- [Llama.cpp](/integration/model-provider/llamacpp)
