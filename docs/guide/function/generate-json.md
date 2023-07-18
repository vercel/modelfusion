---
sidebar_position: 5
---

# Generate JSON

Generates JSON using a prompt and a structure.

## Usage

### generateJson

[generateJson API](/api/modules#generatejson)

Generates JSON using a prompt.
The prompt format depends on the model.
It contains the information required to parse the generated JSON.

#### OpenAI chat model (single function prompt)

The OpenAI single function prompt forces the OpenAI chat model to call the specified function.

```ts
const story = await generateJson(
  new OpenAIChatModel(/* ... */),
  new OpenAIChatSingleFunctionPrompt({
    messages: [
      OpenAIChatMessage.system("You are a story writer. Write a story about:"),
      OpenAIChatMessage.user("A robot learning to love"),
    ],
    fn: {
      name: "story",
      description: "Write the story",
      parameters: z.object({
        title: z.string().describe("The title of the story"),
        content: z.string().describe("The content of the story"),
      }),
    },
  })
);
```

#### OpenAI chat model (auto function prompt)

The OpenAI auto function prompt lets the OpenAI chat model choose between different functions.
It can also just generate a text response.

```ts
const json = await generateJson(
  new OpenAIChatModel({ model: "gpt-3.5-turbo", maxTokens: 1000 }),
  new OpenAIChatAutoFunctionPrompt({
    messages: [OpenAIChatMessage.user(query)],
    fns: {
      getCurrentWeather: {
        description: "Get the current weather in a given location",
        parameters: z.object({
          location: z
            .string()
            .describe("The city and state, e.g. San Francisco, CA"),
          unit: z.enum(["celsius", "fahrenheit"]).optional(),
        }),
      },
      getContactInformation: {
        description: "Get the contact information for a given person",
        parameters: z.object({
          name: z.string().describe("The name of the person"),
        }),
      },
    },
  })
);

switch (json.fnName) {
  case "getCurrentWeather": {
    const { location, unit } = json.value;
    console.log("getCurrentWeather", location, unit);
    break;
  }

  case "getContactInformation": {
    const { name } = json.value;
    console.log("getContactInformation", name);
    break;
  }

  case null: {
    console.log("No function call. Generated text: ", json.value);
  }
}
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
