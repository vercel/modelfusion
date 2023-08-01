---
sidebar_position: 18
---

# Tokenize Text

ModelFusion provides functions and interfaces for text tokenization. The interfaces (`BasicTokenizer` and `FullTokenizer`) are implemented by tokenizer classes (such as `TikTokenTokenizer`) and by model classes (e.g. text generation models).

## Usage

### countTokens

Count the number of tokens in the given text.

#### Example

```ts
const tokenCount = await countTokens(
  tokenizer,
  "At first, Nox didn't know what to do with the pup."
);
```

### BasicTokenizer interface

[Basic Tokenizer API](/api/interfaces/BasicTokenizer)

The basic tokenizer provides only a `tokenize` function.

#### tokenize

Get the tokens that represent the given text.

#### Example

```ts
const tokens = await tokenizer.tokenize(
  "At first, Nox didn't know what to do with the pup."
);
```

### FullTokenizer interface

[Full Tokenizer API](/api/interfaces/FullTokenizer)

The full tokenizer extends the basic tokenizer interface with a `tokenizeWithTexts` function and a `detokenize` function.

#### tokenizeWithTexts

Get the tokens that represent the given text and the text for each token.

#### Example

```ts
const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(
  "At first, Nox didn't know what to do with the pup."
);
```

#### detokenize

Get the text that represents the given tokens.

#### Example

```ts
const tokens = await tokenizer.tokenize(/* ... */);
const reconstructedText = await tokenizer.detokenize(tokens);
```

## Available Providers

- [OpenAI](/integration/model-provider/openai) (full tokenizer)
- [Cohere](/integration/model-provider/cohere) (full tokenizer)
- [Llama.cpp](/integration/model-provider/llamacpp) (basic tokenizer)
