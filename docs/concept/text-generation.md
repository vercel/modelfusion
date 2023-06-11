---
sidebar_position: 3
---

# Text Generation

## Usage

[TextGenerationModel API](/api/interfaces/TextGenerationModel)

### generateText

Generates a text using a prompt.
The prompt format depends on the model.
For example, OpenAI text models expect a string prompt, and OpenAI chat models expect an array of chat messages.

#### With OpenAI text model

```ts
const model = new OpenAITextGenerationModel(/* ... */);

const text = await model.generateText(
  "Write a short story about a robot learning to love:\n\n"
);
```

#### With OpenAI chat model

```ts
const model = new OpenAIChatModel(/* ... */);

const text = await model.generateText([
  OpenAIChatMessage.system(
    "Write a short story about a robot learning to love:"
  ),
]);
```

### generateTextAsFunction

Uses a prompt template to create a function that generates text.
The prompt template is a function that takes an input and returns a prompt that matches the model's prompt format.
The input signature of the prompt templates becomes the call signature of the generated function.

#### With OpenAI text model and simple function signature

```ts
const model = new OpenAITextGenerationModel(/* ... */);

const generateStoryAbout = model.generateTextAsFunction(
  async (character: string) =>
    `Write a short story about ${character} learning to love:\n\n`
);

const story = await generateStoryAbout("a robot");
```

#### With OpenAI chat model and complex function signature

```ts
const model = new OpenAIChatModel(/* ... */);

const generateStoryAbout = model.generateTextAsFunction(
  async ({ character, topic }: { character: string; topic: string }) => [
    OpenAIChatMessage.system(
      `Write a short story about ${character} ${topic}:`
    ),
  ]
);

const story = await generateStoryAbout({
  character: "a robot",
  topic: "enjoying a bicycle ride",
});
```

## Providers

- [OpenAI](/integration/model-provider/openai)
- [Cohere](/integration/model-provider/cohere)
- [Hugging Face](/integration/model-provider/huggingface)
