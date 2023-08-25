---
sidebar_position: 30
---

# Runs

In systems that leverage language or other models, you may often find yourself making multiple model calls within a single execution context.

For instance, in a chatbot application, a process might start by searching for the most relevant document fragments using embeddings, and then proceed to generate a response based on the found fragments.

The [Run interface](/api/interfaces/Run) provides a structured way to share information with model calls and log their executions. You can use the [DefaultRun](/api/classes/DefaultRun) implementation or create your own. To link a model call with a run, pass the run as the second parameter to the model call.

### Example

```ts
const run = new DefaultRun();

const text = await generateText(
  new OpenAITextGenerationModel(/* ... */),
  "Write a short story about a robot learning to love:\n\n",
  { run } // pass in the run in the second parameter
);

console.log(run.successfulModelCalls);
```
