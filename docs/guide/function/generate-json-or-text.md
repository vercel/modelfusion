---
sidebar_position: 6
---

# Generate JSON or Text

Generates JSON (or text as a fallback) using a prompt and multiple schemas.
It either matches one of the schemas or is text reponse.
This is useful for building chatbots with plugins and agents.

## Usage

### generateJsonOrText

[generateJsonOrText API](/api/modules#generatejsonortext)

#### OpenAI chat model

```ts
const { schema, value, text } = await generateJsonOrText(
  new OpenAIChatModel({
    model: "gpt-3.5-turbo",
    maxCompletionTokens: 1000,
  }),
  [
    {
      name: "getCurrentWeather" as const, // mark 'as const' for type inference
      description: "Get the current weather in a given location",
      schema: z.object({
        location: z
          .string()
          .describe("The city and state, e.g. San Francisco, CA"),
        unit: z.enum(["celsius", "fahrenheit"]).optional(),
      }),
    },
    {
      name: "getContactInformation" as const,
      description: "Get the contact information for a given person",
      schema: z.object({
        name: z.string().describe("The name of the person"),
      }),
    },
  ],
  OpenAIChatFunctionPrompt.forSchemasCurried([OpenAIChatMessage.user(query)])
);
```

The result contains:

- `schema`: The name of the schema that was matched or `null` if text was generated.
- `value`: The value of the schema that was matched or `null` if text was generated.
- `text`: The generated text. Optional when a schema was matched.

```ts
switch (schema) {
  case "getCurrentWeather": {
    const { location, unit } = value;
    console.log("getCurrentWeather", location, unit);
    break;
  }

  case "getContactInformation": {
    const { name } = value;
    console.log("getContactInformation", name);
    break;
  }

  case null: {
    console.log("No function call. Generated text: ", text);
  }
}
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
