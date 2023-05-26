import { ChatMessage } from "@/component/ChatMessage";
import { ChatMessageInput } from "@/component/ChatMessageInput";
import { Box } from "@mui/material";
import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from "eventsource-parser";
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

      const decoder = new TextDecoder();

      let fullMessage = "";

      const parser = createParser((event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;

          if (data === "[DONE]") {
            return;
          }

          try {
            const json = JSON.parse(data);

            // TODO clean ZOD parse

            if (json.choices[0].finish_reason != null) {
              return;
            }

            // TODO get role token from delta
            // TODO support multiple choices
            const text = json.choices[0].delta.content;

            if (text != undefined) {
              fullMessage += text;

              // replace text of last entry from messages with new message:
              setMessages((messages) => {
                return [
                  ...messages.slice(0, messages.length - 1),
                  {
                    role: "assistant",
                    content: fullMessage,
                  },
                ];
              });
            }
          } catch (error) {
            // TODO error recovery?
            console.error(error);
          }
        }
      });

      const reader = response.body!.getReader();

      const stream = responseReader(reader);

      for await (const value of stream) {
        parser.feed(decoder.decode(value));
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
