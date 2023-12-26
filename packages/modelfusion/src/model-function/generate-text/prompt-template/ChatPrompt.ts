import { ToolCallResult } from "../../../tool/ToolCallResult.js";
import {
  ImagePart,
  TextPart,
  ToolCallPart,
  ToolResponsePart,
} from "./ContentPart.js";

/**
 * A chat prompt is a combination of a system message and a list
 * of user, assistant, and tool messages.
 *
 * The user messages can contain multi-modal content.
 * The assistant messages can contain tool calls.
 *
 * Note: Not all models and prompt formats support multi-modal inputs and tool calls.
 * The validation happens at runtime.
 *
 * @example
 * ```ts
 * const chatPrompt: ChatPrompt = {
 *   system: "You are a celebrated poet.",
 *   messages: [
 *    { role: "user", content: "Write a short story about a robot learning to love." },
 *    { role: "assistant", content: "Once upon a time, there was a robot who learned to love." },
 *    { role: "user", content: "That's a great start!" },
 *  ],
 * };
 * ```
 */
export interface ChatPrompt {
  system?: string;
  messages: Array<ChatMessage>;
}

export type UserContent = string | Array<TextPart | ImagePart>;
export type AssistantContent = string | Array<TextPart | ToolCallPart>;
export type ToolContent = Array<ToolResponsePart>;

/**
 * A message in a chat prompt.
 *
 * @see ChatPrompt
 */
export type ChatMessage =
  | { role: "user"; content: UserContent }
  | { role: "assistant"; content: AssistantContent }
  | { role: "tool"; content: ToolContent };

export const ChatMessage = {
  user({ text }: { text: string }): ChatMessage {
    return {
      role: "user" as const,
      content: text,
    };
  },

  tool({
    toolResults,
  }: {
    toolResults: ToolCallResult<string, unknown, unknown>[] | null;
  }): ChatMessage {
    return {
      role: "tool" as const,
      content: createToolContent({ toolResults }),
    };
  },

  assistant({
    text,
    toolResults,
  }: {
    text: string | null;
    toolResults: ToolCallResult<string, unknown, unknown>[] | null;
  }): ChatMessage {
    return {
      role: "assistant" as const,
      content: createAssistantContent({ text, toolResults }),
    };
  },
};

function createToolContent({
  toolResults,
}: {
  toolResults: ToolCallResult<string, unknown, unknown>[] | null;
}) {
  const toolContent: ToolContent = [];

  for (const { result, toolCall } of toolResults ?? []) {
    toolContent.push({
      type: "tool-response",
      id: toolCall.id,
      response: result,
    });
  }

  return toolContent;
}

function createAssistantContent({
  text,
  toolResults,
}: {
  text: string | null;
  toolResults: ToolCallResult<string, unknown, unknown>[] | null;
}) {
  const content: AssistantContent = [];

  if (text != null) {
    content.push({ type: "text", text });
  }

  for (const { toolCall } of toolResults ?? []) {
    content.push({ type: "tool-call", ...toolCall });
  }

  return content;
}
