import { PartialBaseUrlPartsApiConfigurationOptions } from "../../core/api/BaseUrlApiConfiguration.js";
import { HuggingFaceApiConfiguration } from "./HuggingFaceApiConfiguration.js";
import {
  HuggingFaceTextEmbeddingModel,
  HuggingFaceTextEmbeddingModelSettings,
} from "./HuggingFaceTextEmbeddingModel.js";
import {
  HuggingFaceTextGenerationModel,
  HuggingFaceTextGenerationModelSettings,
} from "./HuggingFaceTextGenerationModel.js";

/**
 * Creates an API configuration for the HuggingFace API.
 * It calls the API at https://api-inference.huggingface.co/models and uses the `HUGGINGFACE_API_KEY` env variable by default.
 */
export function Api(
  settings: PartialBaseUrlPartsApiConfigurationOptions & {
    apiKey?: string;
  }
) {
  return new HuggingFaceApiConfiguration(settings);
}

/**
 * Create a text generation model that calls a Hugging Face Inference API Text Generation Task.
 *
 * @see https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task
 *
 * @example
 * const model = huggingface.TextGenerator({
 *   model: "tiiuae/falcon-7b",
 *   temperature: 0.7,
 *   maxGenerationTokens: 500,
 *   retry: retryWithExponentialBackoff({ maxTries: 5 }),
 * });
 *
 * const text = await generateText(
 *   model,
 *   "Write a short story about a robot learning to love:\n\n"
 * );
 *
 * @returns A new instance of {@link HuggingFaceTextGenerationModel}.
 */
export function TextGenerator(
  settings: HuggingFaceTextGenerationModelSettings
) {
  return new HuggingFaceTextGenerationModel(settings);
}

/**
 * Create a text embedding model that calls a Hugging Face Inference API Feature Extraction Task.
 *
 * @see https://huggingface.co/docs/api-inference/detailed_parameters#feature-extraction-task
 *
 * @example
 * const model = huggingface.TextEmbedder({
 *   model: "intfloat/e5-base-v2",
 *   maxTexstsPerCall: 5,
 *   retry: retryWithExponentialBackoff({ maxTries: 5 }),
 * });
 *
 * const embeddings = await embedMany(
 *   model,
 *   [
 *     "At first, Nox didn't know what to do with the pup.",
 *     "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
 *   ]
 * );
 *
 * @returns A new instance of {@link HuggingFaceTextEmbeddingModel}.
 */
export function TextEmbedder(settings: HuggingFaceTextEmbeddingModelSettings) {
  return new HuggingFaceTextEmbeddingModel(settings);
}
