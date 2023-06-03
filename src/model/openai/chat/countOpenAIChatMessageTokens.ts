import { TikTokenTokenizer } from "../tokenizer/TikTokenTokenizer.js";
import { OpenAIChatMessage } from "./OpenAIChatMessage.js";
import { OpenAIChatModelType } from "./OpenAIChatModel.js";

/**
 * Prompt tokens that are included automatically for every full
 * chat prompt (several messages) that is sent to OpenAI.
 */
export const OPENAI_CHAT_PROMPT_BASE_TOKEN_COUNT = 2;

/**
 * Prompt tokens that are included automatically for every
 * message that is sent to OpenAI.
 */
export const OPENAI_CHAT_MESSAGE_BASE_TOKEN_COUNT = 5;

export async function countOpenAIChatMessageTokens({
  message,
  model,
}: {
  message: OpenAIChatMessage;
  model: OpenAIChatModelType;
}) {
  return (
    OPENAI_CHAT_MESSAGE_BASE_TOKEN_COUNT +
    (await TikTokenTokenizer.forModel({ model }).countTokens(message.content))
  );
}

export async function countOpenAIChatPromptTokens({
  messages,
  model,
}: {
  messages: OpenAIChatMessage[];
  model: OpenAIChatModelType;
}) {
  let tokens = OPENAI_CHAT_PROMPT_BASE_TOKEN_COUNT;
  for (const message of messages) {
    tokens += await countOpenAIChatMessageTokens({ message, model });
  }
  return tokens;
}
