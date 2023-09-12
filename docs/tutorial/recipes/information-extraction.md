---
sidebar_position: 6
---

# Information Extraction

## generateStructure with OpenAI chat model

With `generateStructure` and an OpenAI chat model, you can use the OpenAI function API to extract structured information from text.

Depending on the context, it can be important to provide an escape hatch when the text is not about the expected topic. In the following example, the model is informed that the text might not be about a city and what to do in this case.

### Example

[Source Code](https://github.com/lgrammel/modelfusion/blob/main/examples/basic/src/recipes/information-extraction-openai-chat-functions.ts)

```ts
const extractNameAndPopulation = async (text: string) =>
  generateStructure(
    new OpenAIChatModel({
      model: "gpt-4",
      temperature: 0, // remove randomness as much as possible
      maxCompletionTokens: 200, // only a few tokens needed for the response
    }),
    new ZodStructureDefinition({
      name: "storeCity",
      description: "Save information about the city",
      // structure supports escape hatch:
      schema: z.object({
        city: z
          .object({
            name: z.string().describe("name of the city"),
            population: z.number().describe("population of the city"),
          })
          .nullable()
          .describe("information about the city"),
      }),
    }),
    [
      OpenAIChatMessage.system(
        [
          "Extract the name and the population of the city.",
          // escape hatch to limit extractions to city information:
          "The text might not be about a city.",
          "If it is not, set city to null.",
        ].join("\n")
      ),
      OpenAIChatMessage.user(text),
    ]
  );

const extractedInformation1 = await extractNameAndPopulation(
  sanFranciscoWikipedia.slice(0, 2000)
);
// { city: { name: 'San Francisco', population: 808437 } }

const extractedInformation2 = await extractNameAndPopulation(
  "Carl was a friendly robot."
);
// { city: null }
```

## generateText with OpenAI chat model

This approach generates a text output and the input needs to fit into the chat prompt.

### Example

[Source Code](https://github.com/lgrammel/modelfusion/blob/main/examples/basic/src/recipes/information-extraction-openai-chat.ts)

```ts
function extractText({ text, topic }: { text: string; topic: string }) {
  return generateText(
    new OpenAIChatModel({
      model: "gpt-4",
      temperature: 0,
      maxCompletionTokens: 500,
    }),
    [
      OpenAIChatMessage.system(
        [
          `## ROLE`,
          `You are an expert at extracting information.`,
          `You need to extract and keep all the information on the topic from the text below.`,
          `Only include information that is directly relevant for the topic.`,
        ].join("\n")
      ),
      OpenAIChatMessage.user(`## TOPIC\n${topic}`),
      OpenAIChatMessage.user(`## TEXT\n${text}`),
    ]
  );
}

const extractedInformation = await extractText({
  text: sanFranciscoWikipedia.slice(0, 2000),
  topic: "number of residents",
});
// San Francisco, officially the City and County of San Francisco, is the fourth most populous
// city in California, with 808,437 residents as of 2022. It is the second most densely populated
// large U.S. city after New York City and the fifth-most densely populated U.S. county. Among...
```
