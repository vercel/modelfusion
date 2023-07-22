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
const { schema, value } = await generateJsonOrText(
  new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
  [
    {
      name: "multiply" as const, // mark 'as const' for type inference
      description: "Multiply two numbers",
      schema: z.object({
        a: z.number().describe("The first number."),
        b: z.number().describe("The second number."),
      }),
    },
    {
      name: "sum" as const,
      description: "Sum two numbers",
      schema: z.object({
        a: z.number().describe("The first number."),
        b: z.number().describe("The second number."),
      }),
    },
  ],
  OpenAIChatFunctionPrompt.forSchemasCurried([
    OpenAIChatMessage.system(
      "You are a calculator. Evaluate the following expression:"
    ),
    OpenAIChatMessage.user("Multiply twelve with 10."),
  ])
);

switch (schema) {
  case null: {
    console.log(`TEXT: ${value}`);
    break;
  }

  case "multiply": {
    console.log(`MULTIPLY: ${value.a * value.b}`);
    break;
  }

  case "sum": {
    console.log(`SUM: ${value.a + value.b}`);
    break;
  }
}
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
