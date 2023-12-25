import { countTokens } from "../../model-function/tokenize-text/countTokens.js";
import { TikTokenTokenizer } from "./TikTokenTokenizer.js";
import { OpenAIChatMessage } from "./OpenAIChatMessage.js";
import {
  OpenAIChatModelType,
  getOpenAIChatModelInformation,
} from "./OpenAIChatModel.js";

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
  const tokenizer = new TikTokenTokenizer({
    model: getOpenAIChatModelInformation(model).baseModel,
  });

  // case: function call without content
  if (message.content == null) {
    return OPENAI_CHAT_MESSAGE_BASE_TOKEN_COUNT;
  }

  // case: simple text content
  if (typeof message.content === "string") {
    return (
      OPENAI_CHAT_MESSAGE_BASE_TOKEN_COUNT +
      (await countTokens(tokenizer, message.content))
    );
  }

  // case: array of content objects
  let contentTokenCount = OPENAI_CHAT_MESSAGE_BASE_TOKEN_COUNT;
  for (const content of message.content) {
    if (content.type === "text") {
      contentTokenCount += await countTokens(tokenizer, content.text);
    }
  }

  return contentTokenCount;
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
