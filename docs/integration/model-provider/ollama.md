---
sidebar_position: 6
---

# Ollama

Generate text and embeddings using [Ollama](https://github.com/jmorganca/ollama). You can run the Ollama server locally or remote.

## Setup

1. Install [Ollama](https://github.com/jmorganca/ollama) following the instructions in the `jmorganca/ollama` repository.
1. Pull the model you want to use, e.g. Llama 2.
   - [List of models](https://ollama.ai/library)
1. Start Ollama in server mode: `ollama serve`

## Configuration

### API Configuration

[Ollama API Configuration](/api/classes/OllamaApiConfiguration)

```ts
const api = new OllamaApiConfiguration({
  // ...
});

const model = ollama.TextGenerator({
  api,
  // ...
});
```

## Model Functions

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/ollama)

### Generate Text

[OllamaTextGenerationModel API](/api/classes/OllamaTextGenerationModel)

```ts
import { ollama, generateText } from "modelfusion";

const text = await generateText(
  ollama.TextGenerator({
    model: "mistral",
    temperature: 0.7,
    maxCompletionTokens: 120,
  }),
  "Write a short story about a robot learning to love:\n\n"
);
```

### Stream Text

[OllamaTextGenerationModel API](/api/classes/OllamaTextGenerationModel)

```ts
import { ollama, streamText } from "modelfusion";

const textStream = await streamText(
  ollama.TextGenerator({
    model: "mistral",
    temperature: 0.7,
    maxCompletionTokens: 500,
  }),
  "Write a short story about a robot learning to love:\n\n"
);

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

### Generate Structure

Structure generation is possible with capable open-source models like [OpenHermes 2.5](https://huggingface.co/teknium/OpenHermes-2.5-Mistral-7B).

```ts
import { ollama, zodSchema, generateStructure } from "modelfusion";
import { z } from "zod";

const model = ollama
  .TextGenerator({
    model: "openhermes2.5-mistral",
    maxCompletionTokens: 1024,
    temperature: 0,
    format: "json", // force JSON output
    raw: true, // prevent Ollama from adding its own prompts
    stopSequences: ["\n\n"], // prevent infinite generation
  })
  .withPromptTemplate(ChatMLPrompt.instruction())
  .asStructureGenerationModel(
    // Instruct the model to generate a JSON object that matches the given schema.
    jsonStructurePrompt((instruction: string, schema) => ({
      system:
        "JSON schema: \n" +
        JSON.stringify(schema.getJsonSchema()) +
        "\n\n" +
        "Respond only using JSON that matches the above schema.",
      instruction,
    }))
  );

const sentiment = await generateStructure(
  model,
  zodSchema(
    z.object({
      sentiment: z
        .enum(["positive", "neutral", "negative"])
        .describe("Sentiment."),
    })
  ),
  {
    system:
      "You are a sentiment evaluator. " +
      "Analyze the sentiment of the following product review:",
    instruction:
      "After I opened the package, I was met by a very unpleasant smell " +
      "that did not disappear even after washing. Never again!",
  }
);
```

### Embed Text

[OllamaTextEmbeddingModel API](/api/classes/OllamaTextEmbeddingModel)

```ts
const embeddings = await embedMany(ollama.TextEmbedder({ model: "llama2" }), [
  "At first, Nox didn't know what to do with the pup.",
  "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
]);
```
