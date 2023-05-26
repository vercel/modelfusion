import { ChatMessage } from "@/component/ChatMessage";
import { ChatMessageInput } from "@/component/ChatMessageInput";
import {
  AsyncQueue,
  convertReadableStreamToAsyncIterator,
} from "@lgrammel/ai-utils/util";
import { Box } from "@mui/material";
import { createParser } from "eventsource-parser";
import Head from "next/head";
import { useState } from "react";
import SecureJSON from "secure-json-parse";
import { z } from "zod";

export default function Home() {
  const [messages, setMessages] = useState<
    Array<{
      role: "assistant" | "user";
      content: string;
    }>
  >([]);
  const [isSending, setIsSending] = useState<boolean>(false);

  const handleSend = async (message: string) => {
    try {
      const userMessage = { role: "user" as const, content: message };
      const messagesToSend = [...messages, userMessage];

      setIsSending(true);
      setMessages([
        ...messagesToSend,
        {
          role: "assistant",
          content: "...",
        },
      ]);

      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messagesToSend),
      });

      const completionDeltaStream = await createCompletionDeltaStream(
        convertReadableStreamToAsyncIterator(response.body!.getReader())
      );

      for await (const completionDelta of completionDeltaStream) {
        if (completionDelta == null) {
          continue;
        }

        if (completionDelta.type === "error") {
          console.error(completionDelta.error);
          continue;
        }

        const delta = completionDelta.delta[0];

        setMessages((currentMessages) => {
          return [
            ...currentMessages.slice(0, currentMessages.length - 1),
            {
              role: delta.role ?? "assistant",
              content: delta.content,
            },
          ];
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Head>
        <title>@lgrammel/ai-utils chat example</title>
      </Head>
      <Box sx={{ height: "100%", overflowY: "auto", marginTop: 4 }}>
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
      </Box>

      <ChatMessageInput disabled={isSending} onSend={handleSend} />
    </>
  );
}

const eventSchema = z.object({
  choices: z.array(
    z.object({
      delta: z.object({
        role: z.enum(["assistant", "user"]).optional(),
        content: z.string().optional(),
      }),
      finish_reason: z.enum(["stop"]).nullable(),
      index: z.number(),
    })
  ),
  created: z.number(),
  id: z.string(),
  model: z.string(),
  object: z.string(),
});

type ChoicesDelta = Array<{
  role: "assistant" | "user" | undefined;
  content: string;
  isComplete: boolean;
  delta: {
    role?: "assistant" | "user";
    content?: string;
  };
}>;

async function createCompletionDeltaStream(stream: AsyncIterable<Uint8Array>) {
  const queue = new AsyncQueue<
    | {
        type: "delta";
        delta: ChoicesDelta;
      }
    | {
        type: "error";
        error: unknown;
      }
  >();

  const choices: ChoicesDelta = [];

  const parser = createParser((event) => {
    if (event.type !== "event") {
      return;
    }

    const data = event.data;

    if (data === "[DONE]") {
      queue.close();
      return;
    }

    try {
      const json = SecureJSON.parse(data);
      const parseResult = eventSchema.safeParse(json);

      if (!parseResult.success) {
        queue.push({
          type: "error",
          error: parseResult.error,
        });
        queue.close();
        return;
      }

      const event = parseResult.data;

      for (let i = 0; i < event.choices.length; i++) {
        const eventChoice = event.choices[i];
        const delta = eventChoice.delta;

        if (choices[i] == null) {
          choices[i] = {
            role: undefined,
            content: "",
            isComplete: false,
            delta,
          };
        }

        const choice = choices[i];

        choice.delta = delta;

        if (eventChoice.finish_reason != null) {
          choice.isComplete = true;
        }

        if (delta.content != undefined) {
          choice.content += delta.content;
        }

        if (delta.role != undefined) {
          choice.role = delta.role;
        }
      }

      queue.push({
        type: "delta",
        delta: choices,
      });
    } catch (error) {
      queue.push({ type: "error", error });
      queue.close();
      return;
    }
  });

  // process the stream asynchonously:
  (async () => {
    const decoder = new TextDecoder();
    for await (const value of stream) {
      parser.feed(decoder.decode(value));
    }
  })();

  return queue;
}
