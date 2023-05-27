import { OpenAIChatMessage } from "./OpenAIChatCompletion.js";
import { OpenAIChatModelData, OpenAIChatModelType } from "./OpenAIChatModel.js";
import {
  OPENAI_CHAT_PROMPT_BASE_TOKENS,
  countOpenAIChatMessageTokens,
} from "./countOpenAIChatMessageTokens.js";

/**
 * Includes the system messages and as many messages as possible (from the end)
 * in the prompt, while leaving enough space for the completion.
 *
 * @param maxGeneratedTokens The maximum number of tokens that the completion
 */
export async function composeRecentMessagesOpenAIChatPrompt({
  model,
  maxGeneratedTokens,
  systemMessage,
  messages,
}: {
  model: OpenAIChatModelType;
  maxGeneratedTokens: number;
  systemMessage: OpenAIChatMessage;
  messages: { role: "user" | "assistant"; content: string }[];
}) {
  let tokenCount = OPENAI_CHAT_PROMPT_BASE_TOKENS;

  tokenCount += await countOpenAIChatMessageTokens({
    message: systemMessage,
    model,
  });

  const tokenLimit = OpenAIChatModelData[model].maxTokens - maxGeneratedTokens;

  const messagesToSend: OpenAIChatMessage[] = [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];

    tokenCount += await countOpenAIChatMessageTokens({
      message,
      model,
    });

    if (tokenCount > tokenLimit) {
      break;
    }

    messagesToSend.unshift(message);
  }

  messagesToSend.unshift(systemMessage);

  return messagesToSend;
}
