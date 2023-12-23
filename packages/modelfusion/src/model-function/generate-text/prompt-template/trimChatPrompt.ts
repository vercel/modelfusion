import {
  HasContextWindowSize,
  HasTokenizer,
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../TextGenerationModel.js";
import { ChatPrompt } from "./ChatPrompt.js";

/**
 * Keeps only the most recent messages in the prompt, while leaving enough space for the completion.
 *
 * It will remove user-ai message pairs that don't fit. The result is always a valid chat prompt.
 *
 * When the minimal chat prompt (system message + last user message) is already too long, it will only
 * return this minimal chat prompt.
 *
 * @see https://modelfusion.dev/guide/function/generate-text#limiting-the-chat-length
 */
export async function trimChatPrompt({
  prompt,
  model,
  tokenLimit = model.contextWindowSize -
    (model.settings.maxGenerationTokens ?? model.contextWindowSize / 4),
}: {
  prompt: ChatPrompt;
  model: TextGenerationModel<ChatPrompt, TextGenerationModelSettings> &
    HasTokenizer<ChatPrompt> &
    HasContextWindowSize;
  tokenLimit?: number;
}): Promise<ChatPrompt> {
  let minimalPrompt = {
    system: prompt.system,
    messages: [prompt.messages[prompt.messages.length - 1]], // last user message
  };

  // check if the minimal prompt is already too long
  const promptTokenCount = await model.countPromptTokens(minimalPrompt);

  // the minimal chat prompt is already over the token limit and cannot be trimmed further:
  if (promptTokenCount > tokenLimit) {
    return minimalPrompt;
  }

  // inner messages
  const innerMessages = prompt.messages.slice(0, -1);

  // taking always a pair of user-message and ai-message from the end, moving backwards
  for (let i = innerMessages.length - 1; i >= 0; i -= 2) {
    const assistantMessage = innerMessages[i];
    const userMessage = innerMessages[i - 1];

    // create a temporary prompt and check if it fits within the token limit
    const attemptedPrompt = {
      system: prompt.system,
      messages: [userMessage, assistantMessage, ...minimalPrompt.messages],
    };
    const tokenCount = await model.countPromptTokens(attemptedPrompt);

    if (tokenCount > tokenLimit) {
      break;
    }

    // if it fits, its the new minimal prompt
    minimalPrompt = attemptedPrompt;
  }

  return minimalPrompt;
}
