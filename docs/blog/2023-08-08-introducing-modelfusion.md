---
title: Introducing ModelFusion
description: Open-source library for building AI applications, chatbots, and agents with JavaScript and TypeScript.
slug: introducing-modelfusion
authors:
  - name: Lars Grammel
    title: AI Engineer
    url: https://github.com/lgrammel
    image_url: https://avatars.githubusercontent.com/u/205036
tags: [modelfusion]
image: /img/blog/2023-08-08-introducing-modelfusion.png
hide_table_of_contents: false
---

<img src="/img/blog/2023-08-08-introducing-modelfusion.png"></img>

If you're a JavaScript or TypeScript developer, you've likely noticed the skyrocketing interest in building AI applications, especially since the launch of ChatGPT in November 2022. With AI on the rise, many are exploring new and creative ways to integrate models into applications, chatbots, and agents. But here's a common roadblock: **there are few libraries designed specifically for JS/TS developers that ease working with AI models, including LLMs (Large Language Models).**

Maybe you've experienced this yourself, as I did: You start with something like LangChain, build your first app, and feel a sense of accomplishment. But then, you hit a wall as you realize it's not easily adjustable to your unique needs. You might then resort to using OpenAI or other APIs directly, only to end up rolling your own framework. It's a path filled with complexity and unnecessary hassle.

That's why I created **[ModelFusion](https://github.com/lgrammel/modelfusion)**. I went through this exact process and recognized the need for a solution that provides many reusable elements and unification across models without being too constraining. Unlike other tools that may feel like "black magic," ModelFusion is designed as a library, not a framework. Think of it as a **toolbox** that empowers you with **full power and control over the underlying models**, adding support features with minimal overhead.

### Quick Example

Here's a simple example demonstrating how you might use ModelFusion to generate text with OpenAI:

```ts
const text = await generateText(
  new OpenAITextGenerationModel({ model: "gpt-3.5-turbo-instruct" }),
  "Write a short story about a robot learning to love:\n\n"
);
```

The response also contains additional information such as the metadata and the full response.
The [ModelFusion documentation](https://modelfusion.dev) contains many [examples and demo apps](https://modelfusion.dev/tutorial/).

### Key Features

Here are the features that make ModelFusion stand out:

- **Type Inference and Validation**: Leveraging TypeScript and Zod, ModelFusion ensures that you get exactly what you expect from your models. No more guesswork, only clear and validated responses.
- **Flexibility and Control**: You're in charge of your prompts, settings, and raw model responses. Adjust and adapt without feeling boxed in by the framework.
- **No Chains and Predefined Prompts**: Start from examples and build applications using familiar JavaScript concepts. Clear and explicit, without any confusing black magic.
- **Support for different AI Models**: Go beyond text with integrations like text-to-image and voice-to-text. ModelFusion supports a variety of models to suit your creative vision.
- **Integrated Support Features**: Focus on your application with essential features like logging, retries, throttling, tracing, and error handling built right in.

ModelFusion integrates with a diverse range of model providers, vector indices, and observability tools, such as **OpenAI**, **Llama.cpp**, **Pinecone**, and **Helicone**. This growing list of integrations offers you, the JS/TS developer, a flexible and adaptable toolbox to suit your unique needs, without any unnecessary complexity.

### Getting Started

Here's what you need to kickstart your journey with ModelFusion:

1. **Explore the Code**: Visit the [ModelFusion GitHub repository](https://github.com/lgrammel/modelfusion) to take a closer look at the source code, contribute, or even raise an issue if you encounter any challenges.
1. **Read the Docs**: If you want to dive deep into the functionalities, the [ModelFusion documentation](https://modelfusion.dev/) is packed with examples, demo apps, and tutorials that will guide you through various use cases and integrations.
1. **Join the Community**: Have any questions or need help? Don't hesitate to engage with other like-minded developers in the [ModelFusion Discord](https://discord.gg/GqCwYZATem). We're here to support each other.

If you're working with AI models in JavaScript or TypeScript, explore ModelFusion; your feedback and participation can shape this toolkit to better serve the developer community.
