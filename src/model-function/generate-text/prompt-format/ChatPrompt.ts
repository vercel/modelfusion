/**
 * A chat prompt is a combination of a system message and a list of messages with the following constraints:
 *
 * - A chat prompt can optionally have a system message.
 * - The first message of the chat must be a user message.
 * - Then it must be alternating between an assistant message and a user message.
 * - The last message must always be a user message (when submitting to a model).
 *
 * You can use a ChatPrompt without an final user message when you e.g. want to display the current state of a conversation.
 *
 * The type checking is done at runtime when you submit a chat prompt to a model with a prompt format.
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
 *
 * @see validateChatPrompt
 */
export type ChatPrompt = {
  system?: string;
  messages: Array<ChatMessage>;
};

/**
 * A message in a chat prompt.
 * @see ChatPrompt
 */
export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
