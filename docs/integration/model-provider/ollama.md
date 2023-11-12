---
sidebar_position: 4
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

const model = new OllamaTextGenerationModel({
  api,
  // ...
});
```

## Model Functions

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/ollama)

### Generate Text

[OllamaTextGenerationModel API](/api/classes/OllamaTextGenerationModel)

```ts
const text = await generateText(
  new OllamaTextGenerationModel({
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
const textStream = await streamText(
  new OllamaTextGenerationModel({
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

### Embed Text

[OllamaTextEmbeddingModel API](/api/classes/OllamaTextEmbeddingModel)

```ts
const embeddings = await embedMany(
  new OllamaTextEmbeddingModel({ model: "llama2" }),
  [
    "At first, Nox didn't know what to do with the pup.",
    "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
  ]
);
```
