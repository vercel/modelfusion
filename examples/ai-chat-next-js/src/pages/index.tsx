import { ChatInputArea } from "@/component/ChatInputArea";
import { ChatMessage } from "@/component/ChatMessage";
import { ChatMessageInput } from "@/component/ChatMessageInput";
import { Box, Button } from "@mui/material";
import { convertReadableStreamToAsyncIterable } from "ai-utils.js/internal";
import { createOpenAIChatResponseDeltaStream } from "ai-utils.js/model-provider/openai";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState<
    Array<{
      role: "assistant" | "user";
      content: string;
    }>
  >([]);
  const [isSending, setIsSending] = useState<boolean>(false);

  const abortController = useRef<AbortController | null>(null);

  const handleSend = async (message: string) => {
    try {
      const userMessage = { role: "user" as const, content: message };
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

      const completionDeltaStream = await createOpenAIChatResponseDeltaStream(
        convertReadableStreamToAsyncIterable(response.body!.getReader())
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
        <title>ai-utils.js chat example</title>
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
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
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
