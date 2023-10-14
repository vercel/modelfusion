import {
  HasContextWindowSize,
  HasTokenizer,
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { ChatPrompt } from "./ChatPrompt.js";
import { validateChatPrompt } from "./validateChatPrompt.js";

/**
 * Keeps only the most recent messages in the prompt, while leaving enough space for the completion.
 *
 * It will remove user-ai message pairs that don't fit. The result is always a valid chat prompt.
 *
 * When the minimal chat prompt (system message + last user message) is already too long, it will only
 * return this minimal chat prompt.
 *
 * @see https://modelfusion.dev/guide/function/generate-text/prompt-format#limiting-the-chat-length
 */
export async function trimChatPrompt({
  prompt,
  model,
  tokenLimit = model.contextWindowSize -
    (model.settings.maxCompletionTokens ?? model.contextWindowSize / 4),
}: {
  prompt: ChatPrompt;
  model: TextGenerationModel<ChatPrompt, TextGenerationModelSettings> &
    HasTokenizer<ChatPrompt> &
    HasContextWindowSize;
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
