import { PartialBaseUrlPartsApiConfigurationOptions } from "../../core/api/BaseUrlApiConfiguration";
import { FireworksAIApiConfiguration } from "./FireworksAIApiConfiguration";
import {
  OpenAICompatibleChatModel,
  OpenAICompatibleChatSettings,
} from "./OpenAICompatibleChatModel";
import { OpenAICompatibleCompletionModel } from "./OpenAICompatibleCompletionModel";
import {
  OpenAICompatibleTextEmbeddingModel,
  OpenAICompatibleTextEmbeddingModelSettings,
} from "./OpenAICompatibleTextEmbeddingModel";
import { PerplexityApiConfiguration } from "./PerplexityApiConfiguration";
import { TogetherAIApiConfiguration } from "./TogetherAIApiConfiguration";

/**
 * Configuration for the Fireworks.ai API.
 *
 * It calls the API at https://api.fireworks.ai/inference/v1 and uses the `FIREWORKS_API_KEY` api key environment variable.
 *
 * @see https://readme.fireworks.ai/docs/openai-compatibility
 */
export function FireworksAIApi(
  settings: PartialBaseUrlPartsApiConfigurationOptions & {
    apiKey?: string;
  } = {}
) {
  return new FireworksAIApiConfiguration(settings);
}

/**
 * Configuration for the Perplexity API.
 *
 * It calls the API at https://api.perplexity.ai/ and uses the `PERPLEXITY_API_KEY` api key environment variable.
 *
 * @see https://docs.perplexity.ai/reference/post_chat_completions
 */
export function PerplexityApi(
  settings: PartialBaseUrlPartsApiConfigurationOptions & {
    apiKey?: string;
  } = {}
) {
  return new PerplexityApiConfiguration(settings);
}

/**
 * Configuration for the Together.ai API.
 *
 * It calls the API at https://api.together.xyz/v1 and uses the `TOGETHER_API_KEY` api key environment variable.
 *
 * @see https://docs.together.ai/docs/openai-api-compatibility
 */
export function TogetherAIApi(
  settings: PartialBaseUrlPartsApiConfigurationOptions & {
    apiKey?: string;
  } = {}
) {
  return new TogetherAIApiConfiguration(settings);
}

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
 * const text = await generateText({
 *   model,
 *   prompt: "Write a short story about a robot learning to love:"
 * });
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
 * const text = await generateText({
 *   model,
 *   prompt: [
 *     openai.ChatMessage.user(
 *       "Write a short story about a robot learning to love:"
 *     ),
 *   ]
 * });
 * ```
 */
export function ChatTextGenerator(settings: OpenAICompatibleChatSettings) {
  return new OpenAICompatibleChatModel(settings);
}

/**
 * Create a text embedding model that calls the OpenAI embedding API.
 *
 * @see https://platform.openai.com/docs/api-reference/embeddings
 *
 * @example
 * const embeddings = await embedMany({
 *   model: openaicompatible.TextEmbedder({ model: "provider-specific-model-name" }),
 *   values: [
 *     "At first, Nox didn't know what to do with the pup.",
 *     "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
 *   ]
 * });
 *
 * @returns A new instance of {@link OpenAITextEmbeddingModel}.
 */
export function TextEmbedder(
  settings: OpenAICompatibleTextEmbeddingModelSettings
) {
  return new OpenAICompatibleTextEmbeddingModel(settings);
}
