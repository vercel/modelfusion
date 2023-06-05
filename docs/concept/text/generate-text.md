---
sidebar_position: 1
---

# Generate Text

The `generateText` function generates text from prompts using [text generation models](/concept/model-provider/models). This function can be called directly or used via `.asFunction` to create a semantically meaningful function for the prompt. Here's more detail about its main arguments:

- `model`: Specify the machine learning model that `generateText` should use for generating text.

- `prompt`: This argument is a function that returns a prompt object, which should be in the format expected by the `model`. The parameters of this function will be the inputs for the `generateText` method or the returned function when used with `.asFunction`.

- `processText`: This is an optional function that allows you to further process the model's output. It's called with extracted text from the model response. By default, this function trims the whitespace from around the model's output, but you can customize this behavior by providing a different function.

The effectiveness of `generateText` largely depends on the suitability and quality of the model and the prompt.

### Example Usage

```ts
// create model with custom settings:
const model = new OpenAITextGenerationModel({
  apiKey: OPENAI_API_KEY,
  model: "text-davinci-003",
  settings: { temperature: 0.7, maxTokens: 500 },
});

// create semantically meaningful function 'generateStory'
// by using a prompt and `generateText.asFunction`:
const generateStory = generateText.asFunction({
  model,
  prompt: async ({ character }: { character: string }) =>
    `Write a short story about ${character} learning to love:\n\n`,
  processText: async (text) => text.trim(), // default behavior
});

// Later in the code:
const text = await generateStory({ character: "a robot" });

console.log(text);
```

### API

- [generateText](/api/modules/#generatetext)
- [generateText.asFunction](/api/namespaces/generateText#asfunction)
