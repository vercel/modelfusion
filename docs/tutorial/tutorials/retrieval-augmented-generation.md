---
sidebar_position: 5
---

# Retrieval Augmented Generation

[Research Paper](https://arxiv.org/abs/2005.11401)

Retrieval augmented generation is a technique where you retrieve relevant information, e.g., from a vector index, and then add it to the prompt of a language model.
Additional instructions can help reduce the hallucination of language models and keep their answers focussed on the provided information.

Retrieval augmented generation consists of two steps:

1. Retrieving relevant information
2. Generating a response using a prompt that contains the retrieved information

### Example

[Source Code](https://github.com/lgrammel/modelfusion/blob/main/examples/basic/src/tutorials/retrieval-augmented-generation-basic.ts)

#### Retrieve related information from a vector index:

```ts
const chunks = await retrieve(
  new VectorIndexRetriever({
    // some vector index that contains the information:
    vectorIndex,
    // use the same embedding model that was used when adding information:
    embeddingModel: openai.TextEmbedder({
      model: "text-embedding-ada-002",
    }),
    // you need to experiment with these setting for your use case:
    maxResults: 3,
    similarityThreshold: 0.8,
  }),
  question
);
```

#### Generate an answer from the retrieved information:

```ts
const answer = await generateText(
  openai.ChatTextGenerator({
    model: "gpt-4",
    temperature: 0, // remove randomness as much as possible
    maxCompletionTokens: 500,
  }),
  [
    OpenAIChatMessage.system(
      [
        // Instruct the model on how to answer:
        `Answer the user's question using only the provided information.`,
        // To reduce hallucination, it is important to give the model an answer
        // that it can use when the information is not sufficient:
        `If the user's question cannot be answered using the provided information, ` +
          `respond with "I don't know".`,
      ].join("\n")
    ),
    OpenAIChatMessage.user(`## QUESTION\n${question}`),
    OpenAIChatMessage.user(`## INFORMATION\n${JSON.stringify(chunks)}`),
  ]
);
```
