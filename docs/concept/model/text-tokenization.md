---
sidebar_position: 18
---

# Text Tokenization

## Usage

[Tokenizer API](/api/interfaces/Tokenizer)

### new Tokenizer

Creates a new tokenizer.
The constructor depends on the tokenizer.
Most tokenizer need the model name or the encoding.

#### Example: TikToken tokenizer (OpenAI)

```ts
const tokenizer = new TikTokenTokenizer({ model: "gpt-4" });
```

### countTokens

Count the number of tokens in the given text.

#### Example

```ts
const tokenCount = await tokenizer.countTokens(
  "At first, Nox didn't know what to do with the pup."
);
```

### tokenize

Get the tokens that represent the given text.

#### Example

```ts
const tokens = await tokenizer.tokenize(
  "At first, Nox didn't know what to do with the pup."
);
```

### tokenizeWithTexts

Get the tokens that represent the given text and the text for each token.

#### Example

```ts
const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(
  "At first, Nox didn't know what to do with the pup."
);
```

### detokenize

Get the text that represents the given tokens.

#### Example

```ts
const tokens = await tokenizer.tokenize(/* ... */);
const reconstructedText = await tokenizer.detokenize(tokens);
```

## Available Providers

- [OpenAI](/integration/model-provider/openai)
- [Cohere](/integration/model-provider/cohere)
