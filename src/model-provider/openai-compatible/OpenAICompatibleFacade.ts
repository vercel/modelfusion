import {
  OpenAICompatibleChatModel,
  OpenAICompatibleChatSettings,
} from "./OpenAICompatibleChatModel.js";

/**
 * Create a text generation model that calls an API that is compatible with OpenAI's chat API.
 *
 * Please note that many providers implement the API with slight differences, which can cause
 * unexpected errors and different behavior in less common scenarios.
 *
 * @see https://platform.openai.com/docs/api-reference/chat/create
 *
 * @example
 * const model = openaicompatible.ChatTextGenerator({
 *   model: "provider-specific-model-name",
 *   temperature: 0.7,
 *   maxCompletionTokens: 500,
 * });
 *
 * const text = await generateText([
 *   model,
 *   OpenAIChatMessage.system(
 *     "Write a short story about a robot learning to love:"
 *   ),
 * ]);
 */
export function ChatTextGenerator(settings: OpenAICompatibleChatSettings) {
  return new OpenAICompatibleChatModel(settings);
}
