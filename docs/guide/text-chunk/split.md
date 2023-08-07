---
sidebar_position: 10
---

# Split Text

When you want to load text chunks into a vector index, you often need to split the text into smaller pieces.
This can help finding the right text chunks when querying the vector index, for example, for [retrieval-augmented generation](/tutorial/recipes/retrieval-augmented-generation).

## Split Functions

Split functions take a text string as input and return an array of text strings.

```ts
type SplitFunction = ({ text }: { text: string }) => string[];
```

The implementations provided by ModelFusion are factory functions that create a split function for a given configuration.

### splitOnSeparator

Splits text on a separator string. The separator is omitted from the resulting chunks.

```ts
const split = splitOnSeparator({ separator: "\n" });
const result = await split({ text });
```

### splitAtCharacter

Splits text recursively until the resulting chunks are smaller than the `maxCharactersPerChunk`. The text is recursively split in the middle, so that all chunks are roughtly the same size.

```ts
const split = splitAtCharacter({ maxCharactersPerChunk: 1000 });
const result = await split({ text });
```

### splitAtToken

Splits text recursively until the resulting chunks are smaller than the `maxTokensPerChunk`, while respecting the token boundaries. The text is recursively split in the middle, so that all chunks are roughtly the same size.

```ts
const split = splitAtToken({
  maxTokensPerChunk: 256,
  // You can get a tokenizer from a model or create it explicitly.
  // The tokenizer must support getting the text for a single token.
  tokenizer: new TikTokenTokenizer({ model: "gpt-4" }),
});
const result = await split({ text });
```

## Splitting Text Chunks

### splitTextChunk

[splitTextChunk API](/api/modules/#splittextchunk)

The `splitTextChunk` function splits a single text chunk into multiple smaller text chunks using a split function.
It retains the properties of the input text chunk other than the `text` property in the output chunks.
This is helpful when you want to retain metadata, e.g. to identify the original source, when ingesting text chunks into a vector index.

#### Example

```ts
// chunks will be of type Array<{ text: string; source: string; }>
const chunks = await splitTextChunk(
  // split function:
  splitAtCharacter({ maxCharactersPerChunk: 1000 }),
  {
    // text property (string) = input to split:
    text: sanFranciscoWikipediaText,
    // other properties are replicated in the output chunks:
    source: "data/san-francisco-wikipedia.json",
  }
);
```

### splitTextChunks

[splitTextChunks API](/api/modules/#splittextchunks)

The `splitTextChunks` functions splits many text chunks into multiple smaller text chunks and flattens the result.
Otherwise it behaves the same as `splitTextChunk`.

#### Example

```ts
const inputChunks: Array<{
  { text: string; source: string; }
}> = [
  // ....
];

// outputChunks will be of type Array<{ text: string; source: string; }>
const outputChunks = await splitTextChunks(
  splitAtCharacter({ maxCharactersPerChunk: 1000 }),
  inputChunks
);
```
