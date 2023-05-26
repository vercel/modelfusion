import { ChatMessage } from "@/component/ChatMessage";
import { ChatMessageInput } from "@/component/ChatMessageInput";
import { Box } from "@mui/material";
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

  const handleSend = (message: string) => {
    console.log(`onSend: ${message}`);

    setIsSending(true);
    setMessages([
      ...messages,
      { role: "user", content: message },
      {
        role: "assistant",
        content: "▍",
      },
    ]);
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
