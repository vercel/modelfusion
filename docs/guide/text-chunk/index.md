---
sidebar_position: 20
---

# Text Chunks

[TextChunk API](/api/modules#textchunk) | [Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/text-chunk/)

A text chunk is a simple object with a text property:

```ts
type TextChunk = {
  text: string;
};
```

It is intended to also contain other properties depending on your use case.
The ModelFusion APIs are designed to handle such objects generically.
