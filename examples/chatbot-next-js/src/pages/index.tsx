import { ChatInputArea } from "@/component/ChatInputArea";
import { ChatMessageView } from "@/component/ChatMessageView";
import { ChatMessageInput } from "@/component/ChatMessageInput";
import { Box, Button } from "@mui/material";
import { ChatMessage, zodSchema } from "modelfusion";
import { readEventSourceStream } from "modelfusion/browser";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

export default function Home() {
  const [messages, setMessages] = useState<Array<ChatMessage>>([]);
  const [isSending, setIsSending] = useState<boolean>(false);

  const abortController = useRef<AbortController | null>(null);

  const handleSend = async (message: string) => {
    try {
      const userMessage: ChatMessage = { role: "user", content: message };
      const messagesToSend = [...messages, userMessage];

      setIsSending(true);
      setMessages([...messagesToSend, { role: "assistant", content: "..." }]);

      abortController.current = new AbortController();

      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messagesToSend),
        signal: abortController.current.signal,
      });

      const textDeltas = readEventSourceStream({
        stream: response.body!,
        schema: zodSchema(z.string()),
      });

      let accumulatedContent = "";
      for await (const textDelta of textDeltas) {
        accumulatedContent += textDelta;

        setMessages((currentMessages) => [
          ...currentMessages.slice(0, currentMessages.length - 1),
          { role: "assistant", content: accumulatedContent },
        ]);
      }
    } finally {
      setIsSending(false);
      abortController.current = null;
    }
  };

  const handleStopGenerate = () => {
    if (abortController.current) {
      abortController.current.abort();
      setIsSending(false);
      abortController.current = null;
    }
  };

  // Add cleanup effect to abort on unmount.
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>ModelFusion chat example</title>
      </Head>
      <Box
        component="main"
        sx={{
          position: "relative",
          flexGrow: 1,
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "relative",
            maxHeight: "100%",
            overflowY: "auto",
          }}
        >
          <Box sx={{ height: "100%", overflowY: "auto", marginTop: 2 }}>
            {messages.map(
              (message, index) =>
                typeof message.content === "string" && (
                  <ChatMessageView
                    key={index}
                    message={{ role: message.role, content: message.content }}
                  />
                )
            )}
            <Box sx={{ height: "160px" }} />
          </Box>
        </Box>

        {isSending ? (
          <ChatInputArea>
            <Button
              variant="outlined"
              sx={{ width: "100%" }}
              onClick={handleStopGenerate}
            >
              Stop Generating
            </Button>
          </ChatInputArea>
        ) : (
          <ChatMessageInput onSend={handleSend} />
        )}
      </Box>
    </>
  );
}
