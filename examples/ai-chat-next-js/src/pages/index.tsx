import { ChatMessage } from "@/component/ChatMessage";
import { ChatMessageInput } from "@/component/ChatMessageInput";
import { Box } from "@mui/material";
import { createParser } from "eventsource-parser";
import Head from "next/head";
import { useState } from "react";

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

      const stream = responseReader(response.body!.getReader());

      const partialMessageStream = await createPartialMessageStream(stream);

      for await (const partialMessage of partialMessageStream) {
        if (partialMessage != null) {
          setMessages((currentMessages) => {
            return [
              ...currentMessages.slice(0, currentMessages.length - 1),
              partialMessage,
            ];
          });
        }
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

async function* responseReader<T>(reader: ReadableStreamDefaultReader<T>) {
  while (true) {
    const result = await reader.read();

    if (result.done) {
      break;
    }

    yield result.value;
  }
}

class AsyncQueue<T> {
  queue: T[];
  resolvers: Array<(options: { value: T | undefined; done: boolean }) => void> =
    [];
  closed: boolean;

  constructor() {
    this.queue = [];
    this.resolvers = [];
    this.closed = false;
  }

  push(value: T) {
    if (this.closed) {
      throw new Error("Pushing to a closed queue");
    }

    const resolve = this.resolvers.shift();
    if (resolve) {
      resolve({ value, done: false });
    } else {
      this.queue.push(value);
    }
  }

  close() {
    while (this.resolvers.length) {
      const resolve = this.resolvers.shift();
      resolve?.({ value: undefined, done: true });
    }
    this.closed = true;
  }

  [Symbol.asyncIterator]() {
    return {
      next: (): Promise<IteratorResult<T | undefined, T | undefined>> => {
        if (this.queue.length > 0) {
          return Promise.resolve({ value: this.queue.shift(), done: false });
        } else if (this.closed) {
          return Promise.resolve({ value: undefined, done: true });
        } else {
          return new Promise((resolve) => this.resolvers.push(resolve));
        }
      },
    };
  }
}

async function createPartialMessageStream(stream: AsyncIterable<Uint8Array>) {
  const queue = new AsyncQueue<{
    role: "assistant" | "user";
    content: string;
  }>();

  let fullMessage = "";

  const parser = createParser((event) => {
    if (event.type === "event") {
      const data = event.data;

      if (data === "[DONE]") {
        queue.close();
        return;
      }

      try {
        const json = JSON.parse(data);

        if (json.choices[0].finish_reason != null) {
          queue.close();
          return;
        }

        const text = json.choices[0].delta.content;

        if (text != undefined) {
          fullMessage += text;

          queue.push({
            role: "assistant",
            content: fullMessage,
          });
        }
      } catch (error) {
        queue.close();
        return;
      }
    }
  });

  const decoder = new TextDecoder();

  // process the stream asynchonously:
  (async () => {
    for await (const value of stream) {
      parser.feed(decoder.decode(value));
    }
  })();

  return queue;
}
