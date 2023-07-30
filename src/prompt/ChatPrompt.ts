/**
 * A chat prompt is a sequence of messages.
 * It can optionally start with a system message.
 * After the optional system message, the first message of the chat must be a user message.
 * Then it must be alternating between a user message and an ai message.
 * It always ends with a user message.
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
 */
// Statically type checking this is impossible to achieve with TypeScript.
// Partial solutions such as https://stackoverflow.com/a/69800688
// fail when the inner messages are dynamically created
// (which is typical for chat systems).
export type ChatPrompt =
  | [...({ user: string } | { ai: string })[]]
  | [{ system: string }, ...({ user: string } | { ai: string })[]];

export class ChatPromptValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatPromptValidationError";
  }
}

export function validateChatPrompt(chatPrompt: ChatPrompt) {
  if (chatPrompt.length < 1) {
    throw new ChatPromptValidationError(
      "ChatPrompt should have at least one message."
    );
  }

  const initialType = "system" in chatPrompt[0] ? "system" : "user";

  if (initialType === "system" && chatPrompt.length === 1) {
    throw new ChatPromptValidationError(
      "A system message should be followed by a user message."
    );
  }

  let expectedType = initialType === "system" ? "user" : "ai";

  for (let i = 1; i < chatPrompt.length; i++) {
    const messageType = "user" in chatPrompt[i] ? "user" : "ai";

    if (messageType !== expectedType) {
      throw new ChatPromptValidationError(
        `Message at index ${i} should be a ${expectedType} message, but it's a ${messageType} message.`
      );
    }

    // Flip the expected type for the next iteration.
    expectedType = expectedType === "user" ? "ai" : "user";
  }

  // If the last message is not a user message, throw an error.
  if (expectedType !== "ai") {
    throw new ChatPromptValidationError(
      "The last message should be a user message."
    );
  }
}
