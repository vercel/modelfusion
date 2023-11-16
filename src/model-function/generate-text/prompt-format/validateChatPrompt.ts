import { ChatPrompt } from "./ChatPrompt.js";
import { ChatPromptValidationError } from "./ChatPromptValidationError.js";

/**
 * Checks if a chat prompt is valid. Throws a `ChatPromptValidationError` if it's not.
 */
export function validateChatPrompt(chatPrompt: ChatPrompt) {
  const messages = chatPrompt.messages;

  if (messages.length < 1) {
    throw new ChatPromptValidationError(
      "ChatPrompt should have at least one message."
    );
  }

  for (let i = 0; i < messages.length; i++) {
    const expectedRole = i % 2 === 0 ? "user" : "assistant";
    const role = messages[i].role;

    if (role !== expectedRole) {
      throw new ChatPromptValidationError(
        `Message at index ${i} should have role '${expectedRole}', but has role '${role}'.`
      );
    }
  }

  if (messages.length % 2 === 0) {
    throw new ChatPromptValidationError(
      "The last message must be a user message."
    );
  }
}
