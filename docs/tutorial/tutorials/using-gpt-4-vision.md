---
sidebar_position: 20
title: Using GPT-4 Vision
---

# Using GPT-4 Vision with ModelFusion

GPT-4 Turbo Vision is a powerful tool for processing images and text in the same prompt. This section will guide you through setting up a basic example to describe an image in detail using ModelFusion.

:::note
To use the OpenAI GPT-4 Vision with ModelFusion, you need to have an [OpenAI API key](https://platform.openai.com/) and access to the `gpt-4-vision-preview` model.
:::

#### Reading the Image

Before we can process an image, we first need to read it into our program. In the following snippet, we're reading an image file from the `data` directory and encoding it as a base64 string:

```ts
import fs from "node:fs";
import path from "node:path";

const image = fs.readFileSync(path.join("data", "example-image.png"), {
  encoding: "base64",
});
```

#### Call the Model

Now that we have our image encoded, we can call the OpenAI GPT-4 Vision model to process the image and provide a detailed description:

```ts
import { OpenAIChatModel, streamText } from "modelfusion";

const textStream = await streamText(
  openai.ChatTextGenerator({
    model: "gpt-4-vision-preview",
    maxGenerationTokens: 1000,
  }),
  [
    OpenAIChatMessage.user([
      { type: "text", text: "Describe the image in detail:" },
      { type: "image", base64Image: image, mimeType: "image/png" },
    ]),
  ]
);
```

#### Alternative: Use an instruction prompt

Alternatively, you can use the `withInstructionPrompt()` method which allows you to use an abstracted prompt template for a single instruction:

```ts
const textStream = await streamText(
  openai
    .ChatTextGenerator({
      model: "gpt-4-vision-preview",
      maxGenerationTokens: 1000,
    })
    .withInstructionPrompt(),
  {
    instruction: [
      { type: "text", text: "Describe the image in detail:\n\n" },
      { type: "image", base64Image: image, mimeType: "image/png" },
    ],
  }
);
```

#### Stream the Output to the Terminal

Once we have our image processed by the model, we can stream the output directly to the terminal:

```ts
for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

In this tutorial, we've walked through the process of using the OpenAI GPT-4 Vision model with ModelFusion to describe an image in detail. You can find the full example in the [OpenAI examples for ModelFusion](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/openai).
