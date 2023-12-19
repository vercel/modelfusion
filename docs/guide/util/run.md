---
sidebar_position: 30
---

# Runs

In systems that leverage language or other models, you may often find yourself making multiple model calls within a single execution context.

For instance, in a chatbot application, a process might start by searching for the most relevant document fragments using embeddings, and then proceed to generate a response based on the found fragments.

The [Run interface](/api/interfaces/Run) provides a structured way to share information with model calls and log their executions. You can use the [DefaultRun](/api/classes/DefaultRun) implementation or create your own.

## Passing a run directly to a model function

To link a model call with a run, you can pass the run as the second parameter to the model call.

### Example

```ts
const run = new DefaultRun();

const text = await generateText(
  openai.CompletionTextGenerator(/* ... */),
  "Write a short story about a robot learning to love:\n\n",
  { run } // pass in the run in the second parameter
);

console.log(run.successfulModelCalls);
```

## Storing the run using AsyncLocalStorage (Node.js)

When ModelFusion runs in a Node.js context, you can use the [AsyncLocalStorage](https://nodejs.org/api/async_context.html) to store the run in a global context.

ModelFusion provides [withRun()](/api/modules/#withrun) and [getRun()](/api/modules/#getrun) functions to make this easy. The model functions automatically use the run stored in the AsyncLocalStorage when you don't pass a run to them.

### Example

```ts
const run = new DefaultRun({
  // ...
});

// stores the run in the AsyncLocalStorage:
withRun(run, async () => {
  // this code could be somewhere deep in your application:

  // automatically uses the run stored in the AsyncLocalStorage:
  const text = await generateText(
    openai.CompletionTextGenerator({
      model: "gpt-3.5-turbo-instruct",
      temperature: 0.7,
      maxGenerationTokens: 500,
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  const run = getRun();
  // do something with the run...
});
```
