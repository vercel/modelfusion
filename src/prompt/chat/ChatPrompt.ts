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
 */
// Statically type checking this is impossible to achieve with TypeScript.
// Partial solutions such as https://stackoverflow.com/a/69800688
// fail when the inner messages are dynamically created

import { TextGenerationModel } from "model-function/generate-text/TextGenerationModel.js";

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

/**
 * Keeps only the most recent messages in the prompt, while leaving enough space for the completion.
 *
 * It will remove user-ai message pairs that don't fit. The result is always a valid chat prompt.
 *
 * When the minimal chat prompt (system message + last user message) is already too long, it will only
 * return this minimal chat prompt.
 */
export async function trimChatPrompt({
  prompt,
  model,
  tokenLimit = model.contextWindowSize - model.maxCompletionTokens,
}: {
  prompt: ChatPrompt;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: TextGenerationModel<ChatPrompt, any, any, any> & {
    contextWindowSize: number;
    maxCompletionTokens: number;
    countPromptTokens: (prompt: ChatPrompt) => PromiseLike<number>;
  };
  tokenLimit?: number;
}): Promise<ChatPrompt> {
  validateChatPrompt(prompt);

  const startsWithSystemMessage = "system" in prompt[0];

  const systemMessage = startsWithSystemMessage ? [prompt[0]] : [];
  let messages: Array<{ system: string } | { user: string } | { ai: string }> =
    [];

  // add the last message (final user message) to the prompt
  messages.push(prompt[prompt.length - 1]);

  // check if the minimal prompt is already too long
  const promptTokenCount = await model.countPromptTokens([
    ...systemMessage,
    ...messages,
  ] as ChatPrompt);

  // the minimal chat prompt is already over the token limit and cannot be trimmed further:
  if (promptTokenCount > tokenLimit) {
    return [...systemMessage, prompt[prompt.length - 1]] as ChatPrompt;
  }

  // inner messages
  const innerMessages = prompt.slice(startsWithSystemMessage ? 1 : 0, -1);

  // taking always a pair of user-message and ai-message from the end, moving backwards
  for (let i = innerMessages.length - 1; i >= 0; i -= 2) {
    const aiMessage = innerMessages[i];
    const userMessage = innerMessages[i - 1];

    // create a temporary array and check if it fits within the token limit
    const tokenCount = await model.countPromptTokens([
      ...systemMessage,
      userMessage,
      aiMessage,
      ...messages,
    ] as ChatPrompt);

    if (tokenCount > tokenLimit) {
      break;
    }

    // if it fits, add the messages to the messages array
    messages = [userMessage, aiMessage, ...messages];
  }

  return [...systemMessage, ...messages] as ChatPrompt;
}
