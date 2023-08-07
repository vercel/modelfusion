---
sidebar_position: 10
---

# Split Text

When you want to load text chunks into a vector index, you often need to split the text into smaller pieces.
This can help finding the right text chunks when querying the vector index, for example, for [retrieval-augmented generation](/tutorial/recipes/retrieval-augmented-generation).

## splitTextChunk

[splitTextChunk API](/api/modules/#splittextchunk)

The `splitTextChunk` function splits a single text chunk into multiple smaller text chunks using a split function.
It retains the properties of the input text chunk other than the `text` property in the output chunks.
This is helpful when you want to retain metadata, e.g. to identify the original source, when ingesting text chunks into a vector index.

#### Example

```ts
// chunks will be of type Array<{ text: string; source: string; }>
const chunks = await splitTextChunk(
  // split function:
  splitRecursivelyAtCharacter({ maxChunkSize: 1000 }),
  {
    // text property (string) = input to split:
    text: sanFranciscoWikipediaText,
    // other properties are replicated in the output chunks:
    source: "data/san-francisco-wikipedia.json",
  }
);
```

## splitTextChunks

[splitTextChunks API](/api/modules/#splittextchunks)

The `splitTextChunks` functions splits many text chunks into multiple smaller text chunks and flattens the result.
Otherwise it behaves the same as `splitTextChunk`.

```ts
const inputChunks: Array<{
  { text: string; source: string; }
}> = [
  // ....
];

// outputChunks will be of type Array<{ text: string; source: string; }>
const outputChunks = await splitTextChunks(
  splitRecursivelyAtCharacter({ maxChunkSize: 1000 }),
  inputChunks
);
```
