/**
 * A chat prompt is a sequence of messages with the following structure:
 *
 * - A chat prompt can optionally start with a system message.
 * - After the optional system message, the first message of the chat must be a user message.
 * - Then it must be alternating between an ai message and a user message.
 * - The last message must always be a user message.
 *
 * The type checking is done at runtime, because there a no good ways to do it statically.
 *
 * @example
 * ```ts
 * [
 *   { system: "You are a celebrated poet." },
 *   { user: "Write a short story about a robot learning to love." },
 *   { ai: "Once upon a time, there was a robot who learned to love." },
 *   { user: "That's a great start!" },
 *  ]
 * ```
 *
 * @see validateChatPrompt
 */
// Statically type checking this is impossible to achieve with TypeScript.
// Partial solutions such as https://stackoverflow.com/a/69800688
// fail when the inner messages are dynamically created
// (which is typical for chat systems).
export type ChatPrompt =
  | [...({ user: string } | { ai: string })[]]
  | [{ system: string }, ...({ user: string } | { ai: string })[]];
