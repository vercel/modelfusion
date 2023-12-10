---
sidebar_position: 20
title: Using BakLLaVA with llama.cpp
---

# Using BakLLaVA with llama.cpp and ModelFusion

[BakLLaVA 1](https://huggingface.co/SkunkworksAI/BakLLaVA-1) is an open-source multi-modal model. It is based on [Mistral 7B](https://mistral.ai/news/announcing-mistral-7b/), with an added [LLaVA 1.5](https://llava-vl.github.io/) architecture to support multi-modal inputs.

Integrating the BakLLaVA model with ModelFusion opens up advanced multi-modal capabilities using open-source models that you can run on your machine. This section will guide you through setting up a basic example to process images and text using the BakLLaVA model in conjunction with [llama.cpp](https://github.com/ggerganov/llama.cpp).

#### Installing Llama.cpp

To use the BakLLaVA model with ModelFusion, you first need to install the [llama.cpp](https://github.com/ggerganov/llama.cpp). The instructions can be found in the Llama.cpp repository.

#### Downloading the BakLLaVA-1 Model

The [BakLLaVA GGUF models are available on HuggingFace](https://huggingface.co/mys/ggml_bakllava-1/tree/main). You need to the download a model and the multi-modal projection file (`mmproj-model-f16.gguf`). Choose a model that works for your machine. For example, the 4-bit quantized model `ggml-model-q4_k.gguf` works well on a MacBook Pro M1 with 16GB of RAM.

#### Run the Llama.cpp Server

Once you have downloaded the model, you can start the llama.cpp server with the model and the multi-modal projection file. Here is an example for Mac. Make sure that you adjust the paths to the model and the projection file:

```sh
./server -m models/bakllava/ggml-model-q4_k.gguf --mmproj models/bakllava/mmproj-model-f16.gguf`
```

This will run the [llama.cpp server](https://github.com/ggerganov/llama.cpp/tree/master/examples/server) on port 8080. You can now use the [ModelFusion Llama.cpp integration](/integration/model-provider/llamacpp) to call the model.

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

Now that we have our image encoded, we can call the BakLLaVA model with an instruction prompt to process the image and provide a detailed description:

```ts
import { LlamaCppBakLLaVA1Prompt, llamacpp, streamText } from "modelfusion";

const textStream = await streamText(
  llamacpp
    .TextGenerator({
      maxCompletionTokens: 1024,
      temperature: 0,
    })
    .withPromptTemplate(LlamaCppBakLLaVA1Prompt.instruction()),
  {
    instruction: [
      { type: "text", text: "Describe the image in detail:\n\n" },
      { type: "image", base64Image: image },
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

In this tutorial, we've walked through the process of using the BakLLaVA model with Llama.cpp and ModelFusion to describe an image in detail. You can find the full example in the [Llama.cpp examples for ModelFusion](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/llamacpp).
