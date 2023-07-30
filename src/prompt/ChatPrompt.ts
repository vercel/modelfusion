type SystemMessage = { system: string };
type UserMessage = { user: string };
type AiMessage = { ai: string };

// Inner messages should be alternating between a user message and an ai message.
// This is hard to achieve with TypeScript. Event solutions such as
// https://stackoverflow.com/a/69800688
// fail when the inner messages are dynamically created (which is typical for chat systems).
//
// Therefore the check that the messages are alternating is done at runtime.
type InnerMessages = (UserMessage | AiMessage)[];

export type ChatPrompt =
  | [UserMessage]
  | [UserMessage, AiMessage, UserMessage] // force start to provide some type checking
  | [UserMessage, AiMessage, UserMessage, AiMessage, UserMessage] // force start to provide some type checking
  | [
      UserMessage,
      AiMessage,
      UserMessage,
      AiMessage,
      ...InnerMessages,
      UserMessage,
    ]
  | [SystemMessage, UserMessage]
  | [SystemMessage, UserMessage, AiMessage, UserMessage] // force start to provide some type checking
  | [SystemMessage, UserMessage, AiMessage, UserMessage, AiMessage, UserMessage] // force start to provide some type checking
  | [
      SystemMessage,
      UserMessage,
      AiMessage,
      UserMessage,
      AiMessage,
      ...InnerMessages,
      UserMessage,
    ];

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
