import {
  OpenAICompatibleChatModel,
  OpenAICompatibleChatSettings,
} from "./OpenAICompatibleChatModel.js";
import { OpenAICompatibleCompletionModel } from "./OpenAICompatibleCompletionModel.js";

/**
 * Create a text generation model that calls an API that is compatible with OpenAI's completion API.
 *
 * Please note that many providers implement the API with slight differences, which can cause
 * unexpected errors and different behavior in less common scenarios.
 *
 * @see https://platform.openai.com/docs/api-reference/completions/create
 *
 * @example
 * ```ts
 * const model = openaicompatible.CompletionTextGenerator({
 *   model: "provider-specific-model-name",
 *   temperature: 0.7,
 *   maxGenerationTokens: 500,
 * });
 *
 * const text = await generateText(
 *   model,
 *   "Write a short story about a robot learning to love:"
 * );
 * ```
 */
export function CompletionTextGenerator(
  settings: OpenAICompatibleChatSettings
) {
  return new OpenAICompatibleCompletionModel(settings);
}

/**
 * Create a text generation model that calls an API that is compatible with OpenAI's chat API.
 *
 * Please note that many providers implement the API with slight differences, which can cause
 * unexpected errors and different behavior in less common scenarios.
 *
 * @see https://platform.openai.com/docs/api-reference/chat/create
 *
 * @example
 * ```ts
 * const model = openaicompatible.ChatTextGenerator({
 *   model: "provider-specific-model-name",
 *   temperature: 0.7,
 *   maxGenerationTokens: 500,
 * });
 *
 * const text = await generateText(
 *   model,
 *   [
 *     openai.ChatMessage.user(
 *       "Write a short story about a robot learning to love:"
 *     ),
 *   ]
 * );
 * ```
 */
export function ChatTextGenerator(settings: OpenAICompatibleChatSettings) {
  return new OpenAICompatibleChatModel(settings);
}
