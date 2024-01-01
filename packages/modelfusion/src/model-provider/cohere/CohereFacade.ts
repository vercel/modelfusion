import { PartialBaseUrlPartsApiConfigurationOptions } from "../../core/api/BaseUrlApiConfiguration.js";
import { CohereApiConfiguration } from "./CohereApiConfiguration.js";
import {
  CohereTextEmbeddingModel,
  CohereTextEmbeddingModelSettings,
} from "./CohereTextEmbeddingModel.js";
import {
  CohereTextGenerationModel,
  CohereTextGenerationModelSettings,
} from "./CohereTextGenerationModel.js";
import { CohereTokenizer, CohereTokenizerSettings } from "./CohereTokenizer.js";

/**
 * Creates an API configuration for the Cohere API.
 * It calls the API at https://api.cohere.ai/v1 and uses the `COHERE_API_KEY` env variable by default.
 */
export function Api(
  settings: PartialBaseUrlPartsApiConfigurationOptions & {
    apiKey?: string;
  }
) {
  return new CohereApiConfiguration(settings);
}

/**
 * Create a text generation model that calls the Cohere Co.Generate API.
 *
 * @see https://docs.cohere.com/reference/generate
 *
 * @example
 * const model = cohere.TextGenerator({
 *   model: "command",
 *   temperature: 0.7,
 *   maxGenerationTokens: 500,
 * });
 *
 * const text = await generateText(
 *    model,
 *   "Write a short story about a robot learning to love:\n\n"
 * );
 *
 * @returns A new instance of {@link CohereTextGenerationModel}.
 */
export function TextGenerator(settings: CohereTextGenerationModelSettings) {
  return new CohereTextGenerationModel(settings);
}

/**
 * Create a text embedding model that calls the Cohere Co.Embed API.
 *
 * @see https://docs.cohere.com/reference/embed
 *
 * @example
 * const embeddings = await embedMany(
 *   cohere.TextEmbedder({ model: "embed-english-light-v2.0" }),
 *   [
 *     "At first, Nox didn't know what to do with the pup.",
 *     "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
 *   ]
 * );
 *
 * @returns A new instance of {@link CohereTextEmbeddingModel}.
 */
export function TextEmbedder(settings: CohereTextEmbeddingModelSettings) {
  return new CohereTextEmbeddingModel(settings);
}

/**
 * Tokenizer for the Cohere models. It uses the Co.Tokenize and Co.Detokenize APIs.
 *
 * @see https://docs.cohere.com/reference/tokenize
 * @see https://docs.cohere.com/reference/detokenize-1
 *
 * @example
 * const tokenizer = cohere.Tokenizer({ model: "command" });
 *
 * const text = "At first, Nox didn't know what to do with the pup.";
 *
 * const tokenCount = await countTokens(tokenizer, text);
 * const tokens = await tokenizer.tokenize(text);
 * const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(text);
 * const reconstructedText = await tokenizer.detokenize(tokens);
 *
 * @returns A new instance of {@link CohereTokenizer}.
 */
export function Tokenizer(settings: CohereTokenizerSettings) {
  return new CohereTokenizer(settings);
}
