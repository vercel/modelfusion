---
sidebar_position: 3
title: Cohere
---

# Cohere

## Setup

1. You can get an API key from [Cohere](https://cohere.com/).
1. The API key can be configured as an environment variable (`COHERE_API_KEY`) or passed in as an option into the model constructor.

## Configuration

### API Configuration

[Cohere API Configuration](/api/classes/CohereApiConfiguration)

```ts
const api = new CohereApiConfiguration({
  // ...
});

const model = new CohereTextGenerationModel({
  api,
  // ...
});
```

## Model Functions

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/cohere)

### Generate Text

[CohereTextGenerationModel API](/api/classes/CohereTextGenerationModel)

```ts
import { CohereTextGenerationModel, generateText } from "modelfusion";

const text = await generateText(
  new CohereTextGenerationModel({
    model: "command-nightly",
    temperature: 0.7,
    maxCompletionTokens: 500,
  }),
  "Write a short story about a robot learning to love:\n\n"
);
```

### Stream Text

[CohereTextGenerationModel API](/api/classes/CohereTextGenerationModel)

```ts
import { CohereTextGenerationModel, streamText } from "modelfusion";

const textStream = await streamText(
  new CohereTextGenerationModel({
    model: "command-nightly",
    temperature: 0.7,
    maxCompletionTokens: 500,
  }),
  "Write a short story about a robot learning to love:\n\n"
);

for await (const textFragment of textStream) {
  process.stdout.write(textFragment);
}
```

### Embed Text

[CohereTextEmbeddingModel API](/api/classes/CohereTextEmbeddingModel)

```ts
import { CohereTextEmbeddingModel, embedTexts } from "modelfusion";

const embeddings = await embedTexts(
  new CohereTextEmbeddingModel({ model: "embed-english-light-v2.0" }),
  [
    "At first, Nox didn't know what to do with the pup.",
    "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
  ]
);
```

### Tokenize Text

[CohereTokenizer API](/api/classes/CohereTokenizer)

```ts
import { CohereTokenizer, countTokens } from "modelfusion";

const tokenizer = new CohereTokenizer({ model: "command-nightly" });

const text = "At first, Nox didn't know what to do with the pup.";

const tokenCount = await countTokens(tokenizer, text);
const tokens = await tokenizer.tokenize(text);
const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(text);
const reconstructedText = await tokenizer.detokenize(tokens);
```
