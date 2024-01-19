---
sidebar_position: 5
---

# Structured Data Generation

Structured data generation using large language models (LLMs) is a technique that can be used to, e.g., create data for tests, to create webpages, or to seed databases. You invoke a strong instruction-following LLM with a schema and a prompt, and then parse the output of the language model to create a typed object that matches the schema.

The main idea is that language models compress the information that they were trained on. Concepts that are well represented in the training data can be extracted through prompting. However, it is important to note that the LLM might hallucinate information for concepts that are not well represented in the training data. This can be fine for some use cases such as fictional data or test data, but it can also be problematic for other use cases such as seeding databases.

You can use the [generateStructure](/guide/function/generate-structure) function to generate structured data. Here is an example:

## Generating city travel destinations with Ollama

In this example, we use [Ollama](/integration/model-provider/ollama) and [OpenHermes 2.5](https://ollama.ai/library/openhermes) to generate a list of travel destinations. The result of the `listCityDestinations` function is a strongly typed object that matches the schema.

```ts
const listCityDestinations = (country: string) =>
  generateStructure({
    model: ollama
      .ChatTextGenerator({
        model: "openhermes",
        temperature: 0,
      })
      .asStructureGenerationModel(jsonStructurePrompt.text()),

    schema: zodSchema(
      z.object({
        destinations: z.array(
          z.object({
            city: z.string(),
            region: z.string(),
            description: z.string(),
          })
        ),
      })
    ),

    prompt:
      `List 5 city destinations in ${country} for weekend trips. ` +
      `Describe in 1 sentence what is unique and interesting about each destination.`,
  });
```

## Resources

- [Blog Post: Effortlessly Generate Structured Information with Ollama, Zod, and ModelFusion](/blog/generate-structured-information-ollama)
