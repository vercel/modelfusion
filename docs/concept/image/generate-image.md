---
sidebar_position: 1
---

# Generate Image

The `generateImage` function generates images from prompts using [images generation models](/concept/model-provider/models). This function can be called directly or used via `.asFunction` to create a semantically meaningful function for the prompt. Here's more detail about its main arguments:

- `model`: Specify the machine learning model that `generateImage` should use for generating the image.

- `prompt`: This argument is a function that returns a prompt object, which should be in the format expected by the `model`. The parameters of this function will be the inputs for the `generateImage` method or the returned function when used with `.asFunction`.

The effectiveness of `generateImage` largely depends on the suitability and quality of the model and the prompt.

### Example Usage

```ts
// create model with custom settings:
const model = new StabilityImageGenerationModel({
  apiKey: STABILITY_API_KEY,
  model: "stable-diffusion-512-v2-1",
  settings: {
    cfgScale: 7,
    clipGuidancePreset: "FAST_BLUE",
    height: 512,
    width: 512,
    samples: 1,
    steps: 30,
  },
});

// create semantically meaningful function 'generatePainting'
// by using a prompt and `generateImage.asFunction`:
const generatePainting = generateImage.asFunction({
  model,
  prompt: async ({ description }: { description: string }) => [
    { text: description },
    { text: "style of early 19th century painting", weight: 0.5 },
  ],
});

// Later in the code:
const imageBase64 = await generatePainting({
  description: "the wicked witch of the west",
});

// Further actions, e.g. save image to file:
const path = `./image-example.png`;
fs.writeFileSync(path, Buffer.from(imageBase64, "base64"));
console.log(`Image saved to ${path}`);
```

### API

- [generateImage](/api/modules/#generateimage)
- [generateImage.asFunction](/api/namespaces/generateImage#asfunction)
