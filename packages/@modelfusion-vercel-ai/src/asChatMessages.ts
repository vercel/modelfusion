import { Message } from "ai";
import { ChatMessage } from "modelfusion";

/**
 * Convert Vercel AI SDK messages to ModelFusion ChatMessages.
 */
export function asChatMessages(messages: Message[]): ChatMessage[] {
  return messages.filter(
    // only user and assistant roles are supported:
    (message) => message.role === "user" || message.role === "assistant"
  ) as ChatMessage[];
}
