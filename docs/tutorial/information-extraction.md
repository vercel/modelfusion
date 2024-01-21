---
sidebar_position: 10
---

# Information Extraction

## generateStructure with OpenAI chat model

With `generateStructure` and an OpenAI chat model, you can use the OpenAI function API to extract structured information from text.

Depending on the context, it can be important to provide an escape hatch when the text is not about the expected topic. In the following example, the model is informed that the text might not be about a city and what to do in this case.

### Example

[Source Code](https://github.com/lgrammel/modelfusion/blob/main/examples/basic/src/tutorial/information-extraction-openai-chat-functions.ts)

```ts
const extractNameAndPopulation = async (text: string) =>
  generateStructure({
    model: openai
      .ChatTextGenerator({
        model: "gpt-4",
        temperature: 0, // remove randomness as much as possible
        maxGenerationTokens: 200, // only a few tokens needed for the response
      })
      .asFunctionCallStructureGenerationModel({
        fnName: "storeCity",
        fnDescription: "Save information about the city",
      })
      .withInstructionPrompt(),

    schema: zodSchema(
      z.object({
        city: z
          .object({
            name: z.string().describe("name of the city"),
            population: z.number().describe("population of the city"),
          })
          .nullable() // structure supports escape hatch
          .describe("information about the city"),
      })
    ),

    prompt: {
      system: [
        "Extract the name and the population of the city.",
        // escape hatch to limit extractions to city information:
        "The text might not be about a city.",
        "If it is not, set city to null.",
      ].join("\n"),
      instruction: text,
    },
  });

const extractedInformation1 = await extractNameAndPopulation(
  sanFranciscoWikipedia.slice(0, 2000)
);
// { city: { name: 'San Francisco', population: 808437 } }

const extractedInformation2 = await extractNameAndPopulation(
  "Carl was a friendly robot."
);
// { city: null }
```
