import { ChatPrompt } from "./ChatPrompt.js";

export class ChatPromptValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatPromptValidationError";
  }
}

/**
 * Checks if a chat prompt is valid. Throws a `ChatPromptValidationError` if it's not.
 */
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
