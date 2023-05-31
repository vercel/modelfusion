import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../../internal/postToApi.js";
import { failedCohereCallResponseHandler } from "../CohereError.js";
import {
  CohereTextEmbedding,
  cohereTextEmbeddingSchema,
} from "./CohereTextEmbedding.js";
import { CohereTextEmbeddingModelType } from "./CohereTextEmbeddingModel.js";

/**
 * Call the Cohere Co.Embed API to generate an embedding for the given input.
 *
 * @see https://docs.cohere.com/reference/embed
 *
 * @example
 * const response = await generateCohereEmbedding({
 *   apiKey: COHERE_API_KEY,
 *   model: "embed-english-light-v2.0",
 *   texts: [
 *     "At first, Nox didn't know what to do with the pup.",
 *     "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
 *   ],
 * });
 */
export async function generateCohereEmbedding({
  baseUrl = "https://api.cohere.ai/v1",
  abortSignal,
  apiKey,
  model,
  texts,
  truncate,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
  model: CohereTextEmbeddingModelType;
  texts: string[];
  truncate?: "NONE" | "START" | "END";
}): Promise<CohereTextEmbedding> {
  return postJsonToApi({
    url: `${baseUrl}/embed`,
    apiKey,
    body: {
      model,
      texts,
      truncate,
    },
    failedResponseHandler: failedCohereCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      cohereTextEmbeddingSchema
    ),
    abortSignal,
  });
}
