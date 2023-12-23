import { MultiModalInput } from "./Content.js";

/**
 * A textual chat prompt is a combination of a system message and a list of user and assistant messages.
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
export interface TextChatPrompt {
  system?: string;
  messages: Array<TextChatMessage>;
}

/**
 * A text message in a chat prompt.
 * @see TextChatPrompt
 */
export type TextChatMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string };

export interface MultiModalChatPrompt {
  system?: string;
  messages: Array<MultiModalChatMessage>;
}

export type MultiModalChatMessage =
  | { role: "user"; content: MultiModalInput }
  | { role: "assistant"; content: string };
