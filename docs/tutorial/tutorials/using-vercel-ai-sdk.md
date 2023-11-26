---
sidebar_position: 20
title: Using Vercel AI SDK
---

# Using the Vercel AI SDK with ModelFusion

The [Vercel AI SDK](https://github.com/vercel/ai) is a library for building AI-powered streaming text and chat UIs. It provides hooks for React, Svelte, Vue, and Solid to easily integrate streaming AI responses into your web application. You can use the Vercel AI SDK with ModelFusion streams out of the box.

## Ollama Example

[Ollama](https://ollama.ai/) lets you run AI models locally on your machine.

Here is an example of a Next.js route that you can call from the Vercel AI `useChat` hook:

```ts
import { Message, StreamingTextResponse, readableFromAsyncIterable } from "ai";
import {
  ChatMessage,
  Llama2PromptFormat,
  ollama,
  streamText,
} from "modelfusion";

export const runtime = "edge";

export async function POST(req: Request) {
  // Read the messages from the Vercel AI useChat request:
  const { messages }: { messages: Message[] } = await req.json();

  // Use ModelFusion to call Ollama:
  const textStream = await streamText(
    ollama
      .TextGenerator({
        model: "llama2:chat",
        maxCompletionTokens: -1, // infinite generation
        temperature: 0,
        raw: true, // use raw inputs and map to prompt format below
      })
      .withPromptFormat(Llama2PromptFormat.chat()), // Llama2 prompt
    {
      system:
        "You are an AI chat bot. " +
        "Follow the user's instructions carefully.",

      // map Vercel AI SDK Message to ModelFusion ChatMessage:
      messages: messages.filter(
        // only user and assistant roles are supported:
        (message) => message.role === "user" || message.role === "assistant"
      ) as ChatMessage[],
    }
  );

  // Return the result using the Vercel AI SDK:
  return new StreamingTextResponse(readableFromAsyncIterable(textStream));
}
```

You can find more examples in the [Next.js, Vercel AI SDK, Ollama & ModelFusion starter](https://github.com/lgrammel/modelfusion-ollama-nextjs-starter) and the [Next.js, Vercel AI SDK, llama.cpp & ModelFusion starter](https://github.com/lgrammel/modelfusion-llamacpp-nextjs-starter)
