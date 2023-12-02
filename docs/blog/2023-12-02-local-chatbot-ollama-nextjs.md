---
description: Tutorial on how to build a local chatbot with Next.js, Ollama, ModelFusion and the Vercel AI SDK.
slug: ollama-nextjs-chatbot
authors:
  - name: Lars Grammel
    title: AI Engineer
    url: https://github.com/lgrammel
    image_url: https://avatars.githubusercontent.com/u/205036
tags: [tutorial, chatbot, ollama, nextjs, modelfusion, vercel-ai-sdk]
image: /img/blog/2023-12-02-local-chatbot-ollama-nextjs.png
hide_table_of_contents: false
---

# Create Your Own Local Chatbot with Next.js, Ollama, and ModelFusion

<img src="/img/blog/2023-12-02-local-chatbot-ollama-nextjs.png"></img>

In this blog post, we'll build a [Next.js](https://nextjs.org/) chatbot that runs on your computer. We'll use [Ollama](https://ollama.ai/) to serve the [OpenHermes 2.5 Mistral](https://ollama.ai/library/openhermes2.5-mistral) LLM (large language model) locally, the [Vercel AI SDK](https://github.com/vercel/ai) to handle stream forwarding and rendering, and [ModelFusion](https://modelfusion.ai/) to integrate Ollama with the Vercel AI SDK. The chatbot will be able to generate responses to user messages in real-time.

The architecture looks like this:

<img src="/img/blog/2023-12-02-local-chatbot-ollama-nextjs-diagram.png"></img>

You can find a full Next.js, Vercel AI SDK, Ollama & ModelFusion starter with more examples here: [github/com/lgrammel/modelfusion-ollama-nextjs-starter](https://github.com/lgrammel/modelfusion-ollama-nextjs-starter)

This blog post explains step by step how to build the chatbot. Let's get started!

## Installing Ollama

The first step to getting started with our local chatbot is installing [Ollama](https://ollama.ai/). Ollama is a versatile platform that allows us to run LLMs like [OpenHermes 2.5 Mistral](https://ollama.ai/library/openhermes2.5-mistral) on your machine. This is crucial for our chatbot as it forms the backbone of its AI capabilities.

### Step 1: Download Ollama

1. Visit the official [Ollama website](https://ollama.ai/).
1. Follow the instructions provided on the site to download and install Ollama on your machine.

### Step 2: Pulling OpenHermes 2.5 Mistral

Once Ollama is installed, you'll need to pull the specific LLM we will be using for this project, [OpenHermes 2.5 Mistral](https://ollama.ai/library/openhermes2.5-mistral). As of November 2023, it is one of the best open-source LLMs in the 7B parameter class. You need at least a MacBook M1 with 8GB of RAM or a similarly compatible computer to run it.

1. Open your terminal or command prompt.
2. Run the following command:
   ```sh
   ollama pull openhermes2.5-mistral
   ```

This command will download the LLM and store it on your machine. You can now use it to generate text.

:::tip
You can find the best-performing open-source LLMs on the [HuggingFace Open LLM Leaderboard](https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard). They are ranked using a mix of benchmarks and grouped into different parameter classes so you can choose the best LLM for your machine. Many of the LLMs on the leaderboard are available on Ollama.
:::

After completing these steps, your system is equipped with Ollama and the OpenHermes 2.5 Mistral model, ready to be integrated into our Next.js chatbot.

## Creating the Next.js Project

The next step is to create the foundational structure of our chatbot using [Next.js](https://nextjs.org/). Next.js will be used to build our chatbot application's frontend and API routes.

Here are the steps to create the Next.js project:

1. Execute the following command in your terminal to create a new Next.js project:

   ```sh
   npx create-next-app@latest ollama-nextjs-chatbot
   ```

2. You will be prompted to configure various aspects of your Next.js application. Here are the settings for our chatbot project:

   ```
   Would you like to use TypeScript? Yes
   Would you like to use ESLint? Yes
   Would you like to use Tailwind CSS? Yes
   Would you like to use `src/` directory? Yes
   Would you like to use App Router? (recommended) Yes
   Would you like to customize the default import alias? No
   ```

   These settings enable TypeScript for robust type-checking, ESLint for code quality, and Tailwind CSS for styling. Using the src/ directory and App Router enhances the project structure and routing capabilities.

3. Once the project is initialized, navigate to the project directory:

   ```sh
   cd ollama-nextjs-chatbot
   ```

By following these steps, you have successfully created and configured your Next.js project. This forms the base of our chatbot application, where we will later integrate the AI functionalities using Ollama and ModelFusion. The next part of the tutorial will guide you through installing additional libraries and setting up the backend logic for the chatbot.

:::tip
You can verify your setup by running `npm run dev` in your terminal and navigating to [http://localhost:3000](http://localhost:3000) in your browser. You should see the default Next.js page.
:::

## Installing the Required Libraries

We will use several libraries to build our chatbot. Here is an overview of the libraries we will use:

- **Vercel AI SDK**: The [Vercel AI SDK](https://github.com/vercel/ai) provides React hooks for creating chats (`useChat`) as well as streams that forward AI responses to the frontend (`StreamingTextResponse`).
- **ModelFusion**: [ModelFusion](https://github.com/lgrammel/modelfusion) is a library for building multi-modal AI applications that I've been working on. It provides a `streamText` function that calls AI models and returns a streaming response. ModelFusion also contains an Ollama integration that we will use to access the OpenHermes 2.5 Mistral model.
- **ModelFusion Vercel AI SDK Integration**: The [@modelfusion/vercel-ai](https://github.com/lgrammel/modelfusion/tree/main/extensions/vercel-ai) integration provides a `ModelFusionTextStream` that adapts ModelFusion's text streaming to the Vercel AI SDK's streaming response.

You can run the following command in the chatbot project directory to install all libraries:

```sh
npm install --save ai modelfusion @modelfusion/vercel-ai
```

You have now installed all the libraries required for building the chatbot. The next section of the tutorial will guide you through creating an API route for handling chat interactions.

## Creating an API Route for the Chatbot

Creating the API route for the [Next.js app router](https://nextjs.org/docs/app) is the next step in building our chatbot. The API route will handle the chat interactions between the user and the AI.

Navigate to the `src/app/api/chat/` directory in your project and create a new file named `route.ts` to serve as our API route file.

The API route requires several important imports from the `ai`, `modelfusion`, and `@modelfusion/vercel-ai` libraries. These imports bring in necessary classes and functions for streaming AI responses and processing chat messages.

```ts
import { ModelFusionTextStream } from "@modelfusion/vercel-ai";
import { Message, StreamingTextResponse } from "ai";
import {
  ChatMLPromptFormat,
  TextChatMessage,
  ollama,
  streamText,
} from "modelfusion";
```

We will use the [edge runtime](https://edge-runtime.vercel.app/):

```ts
export const runtime = "edge";
```

The route itself is a POST request that takes a list of messages as input:

```ts
export async function POST(req: Request) {
  // useChat will send a JSON with a messages property:
  const { messages }: { messages: Message[] } = await req.json();

  // ...
}
```

We initialize a ModelFusion text generation model for calling Ollama and using the OpenHermes 2.5 Mistral model. We set the `maxCompletionTokens` to `-1` to allow for infinite generation, and the `temperature` to `0` to disable randomness. The `raw` option is set to `true`, because we apply the ChatML prompt format (for the OpenHermes model) to the messages using ModelFusion:

```ts
const model = ollama
  .TextGenerator({
    model: "openhermes2.5-mistral",
    maxCompletionTokens: -1, // infinite generation
    temperature: 0,
    raw: true, // use raw inputs and map to prompt format below
  })
  .withPromptFormat(ChatMLPromptFormat.chat()); // ChatML prompt format
```

:::note
Different AI models use other prompt formats. The prompt format for a given model is often found in the model card. Using an incorrect prompt format can lead to unexpected results because models are specifically trained to work with a specific prompt format.
:::

Next, we create a [ModelFusion chat prompt](https://modelfusion.dev/guide/function/generate-text#chat-prompts) from the AI SDK messages:

```ts
const prompt = {
  system: "You are an AI chatbot. Follow the user's instructions carefully.",

  // map Vercel AI SDK Message to ModelFusion TextChatMessage:
  messages: messages.filter(
    // only user and assistant roles are supported:
    (message) => message.role === "user" || message.role === "assistant"
  ) as TextChatMessage[],
};
```

With the prompt and the model, you can then use ModelFusion to call Ollama and generate a streaming response:

```ts
const textStream = await streamText(model, prompt);
```

Finally you can return the streaming text response with the Vercel AI SDK. The `ModelFusionTextStream` adapts ModelFusion's streaming response to the Vercel AI SDK's streaming response:

```ts
  // Return the result using the Vercel AI SDK:
  return new StreamingTextResponse(ModelFusionTextStream(textStream));
}
```

## Adding the Chat Interface

We need to create a dedicated chat page to bring our chatbot to life on the frontend. This page will be located at `src/app/page.tsx` and will leverage the useChat hook from the Vercel AI SDK. The `useChat` hook calls the `/api/chat` route and processes the streaming response as an array of messages, rendering each token as it arrives.

```tsx
// src/app/page.tsx
"use client";

import { useChat } from "ai/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((message) => (
        <div
          key={message.id}
          className="whitespace-pre-wrap"
          style={{ color: message.role === "user" ? "black" : "green" }}
        >
          <strong>{`${message.role}: `}</strong>
          {message.content}
          <br />
          <br />
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
```

It's important to clean up the global styles for a more visually appealing chat interface. By default, the Next.js page is dark. We clean up `src/app/globals.css` to make it readable:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Running the Chatbot Application

With the chat page in place, it's time to run our chatbot app and see the result of our hard work.

You can launch the development server by running the following command in your terminal:

```sh
npm run dev
```

You can now navigate to [http://localhost:3000](http://localhost:3000) in your browser to see the chat page. You can interact with the chatbot by typing messages into the input field. The chatbot will respond to your messages in real-time.

Below is a screenshot of what you can expect your chatbot interface to look like when you run the application:

<img src="/img/blog/2023-12-02-local-chatbot-ollama-nextjs-screenshot.png"></img>

## Conclusion

And there you have it—a fully functional local chatbot built with Next.js, Ollama, and ModelFusion at your fingertips. We've traversed the path from setting up our development environment, integrating a robust language model, and spinning up a user-friendly chat interface.

The code is intended as a starting point for your projects. Have fun exploring!

For the complete source code and further examples to fuel your creativity, visit: [github.com/lgrammel/modelfusion-ollama-nextjs-starter](https://github.com/lgrammel/modelfusion-ollama-nextjs-starter)
