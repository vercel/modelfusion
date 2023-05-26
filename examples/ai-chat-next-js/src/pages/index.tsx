import { ChatMessage } from "@/component/ChatMessage";
import { ChatMessageInput } from "@/component/ChatMessageInput";
import { Box } from "@mui/material";
import Head from "next/head";
import { useState } from "react";
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

      const decoder = new TextDecoder();

      const reader = response.body!.getReader();

      let done;
      let value;

      let responseMessage = "";

      while (!done) {
        ({ value, done } = await reader.read());

        const decoded = decoder.decode(value);

        if (decoded === "done") {
          break;
        }

        decoded.split("\n").forEach((chunk) => {
          if (chunk === "") {
            return;
          }

          const parsed = z
            .object({
              type: z.literal("chunk"),
              text: z.string().optional(),
            })
            .parse(JSON.parse(chunk));

          responseMessage += parsed.text ?? "";
        });

        // replace text of last entry from messages with new message:
        setMessages((messages) => {
          return [
            ...messages.slice(0, messages.length - 1),
            {
              role: "assistant",
              content: responseMessage,
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
