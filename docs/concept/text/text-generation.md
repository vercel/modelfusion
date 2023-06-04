---
sidebar_position: 1
---

# Generate Text

`ai-utils.js` offers two high-level functions for generating text:

- `generate`

### Example Usage

```ts
// create model:
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
});

// Later in the code:
const text = await generateStory({ character: "a robot" });

console.log(text);
```

### API

- [generateText](/api/modules/#generatetext)
- [generateText.safe](/api/namespaces/generateText#safe)
- [generateText.asFunction](/api/namespaces/generateText#asfunction)
- [generateText.asSafeFunction](/api/namespaces/generateText#assafefunction)
