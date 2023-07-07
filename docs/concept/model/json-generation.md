---
sidebar_position: 5
---

# JSON Generation

## Usage

[JsonGenerationModel API](/api/interfaces/JsonGenerationModel)

### generateJson

Generates JSON using a prompt and a structure.
The prompt format depends on the model.
The structure is a JSON object that describes the desired output.
The parameters must be a Zod object schema.

#### With OpenAI chat model

```ts
const model = new OpenAIChatModel(/* ... */);

const story = await model.generateJson(
  [
    OpenAIChatMessage.system("You are a story writer. Write a story about:"),
    OpenAIChatMessage.user("A robot learning to love"),
  ],
  {
    name: "story",
    description: "Write the story",
    parameters: z.object({
      title: z.string().describe("The title of the story"),
      content: z.string().describe("The content of the story"),
    }),
  }
);
```

### generateJsonAsFunction

Uses a prompt template to create a function that generates JSON.
The prompt template is a function that takes an input and returns a prompt that matches the model's prompt format.
The input signature of the prompt templates becomes the call signature of the generated function.

#### With OpenAI chat model

```ts
const model = new OpenAITextGenerationModel(/* ... */);

const generateStoryAbout = model.generateJsonAsFunction(
  async (theme: string) => [
    OpenAIChatMessage.system("You are a story writer. Write a story about:"),
    OpenAIChatMessage.user(theme),
  ],
  {
    name: "story",
    description: "Write the story",
    parameters: z.object({
      title: z.string().describe("The title of the story"),
      content: z.string().describe("The content of the story"),
    }),
  }
);

const story = await generateStoryAbout("A robot learning to love");
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
