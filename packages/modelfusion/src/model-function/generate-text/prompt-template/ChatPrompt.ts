import { Content } from "./Content.js";

/**
 * A chat prompt is a combination of a system message and a list of user and assistant messages.
 *
 * The user messages can contain multi-modal content.
 *
 * Note: Not all models and prompt formats support multi-modal inputs.
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

/**
 * A message in a chat prompt.
 *
 * @see ChatPrompt
 */
export type ChatMessage =
  | { role: "user"; content: Content }
  | { role: "assistant"; content: string };
