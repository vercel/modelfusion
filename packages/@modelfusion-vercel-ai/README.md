# @modelfusion/vercel-ai

[ModelFusion](https://github.com/lgrammel/modelfusion) streams for the [Vercel AI SDK](https://github.com/vercel/ai).

## Usage

`ModelFusionTextStream(result: AsyncIterable<string>, callbacks?: AIStreamCallbacksAndOptions)`

You can call `ModelFusionTextStream` with the result from [streamText](https://modelfusion.dev/guide/function/generate-text#streamtext). This stream is compatible with the Vercel AI SDK and supports the callbacks and stream data features.

To convert Vercel AI SDK messages to ModelFusion messages, use the `asChatMessages` helper.

## Example: Ollama & Next.js

This is an example for a Next.js app router API route. It uses the ModelFusion [Ollama](https://github.com/jmorganca/ollama) integration. For a full example app, check out the [Next.js, Vercel AI SDK, Ollama & ModelFusion starter](https://github.com/lgrammel/modelfusion-ollama-nextjs-starter).

```ts
// app/api/chat/route.ts
import { asChatMessages, ModelFusionTextStream } from "@modelfusion/vercel-ai";
import { Message, StreamingTextResponse } from "ai";
import { ollama, streamText } from "modelfusion";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  // Use ModelFusion to call Ollama:
  const textStream = await streamText({
    model: ollama.ChatTextGenerator({ model: "llama2:chat" }).withChatPrompt(),
    prompt: {
      system:
        "You are an AI chat bot. " +
        "Follow the user's instructions carefully.",

      // map Vercel AI SDK Message to ModelFusion ChatMessage:
      messages: asChatMessages(messages),
    },
  });

  // Return the result using the Vercel AI SDK:
  return new StreamingTextResponse(
    // Convert the text stream to a Vercel AI SDK compatible stream:
    ModelFusionTextStream(
      textStream,
      // optional callbacks:
      {
        onStart() {
          console.log("onStart");
        },
        onToken(token) {
          console.log("onToken", token);
        },
        onCompletion: () => {
          console.log("onCompletion");
        },
        onFinal(completion) {
          console.log("onFinal", completion);
        },
      }
    )
  );
}
```
