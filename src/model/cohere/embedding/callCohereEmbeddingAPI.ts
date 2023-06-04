import z from "zod";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../../internal/postToApi.js";
import { failedCohereCallResponseHandler } from "../internal/failedCohereCallResponseHandler.js";
import { CohereTextEmbeddingModelType } from "./CohereTextEmbeddingModel.js";

export const cohereTextEmbeddingResponseSchema = z.object({
  id: z.string(),
  texts: z.array(z.string()),
  embeddings: z.array(z.array(z.number())),
  meta: z.object({
    api_version: z.object({
      version: z.string(),
    }),
  }),
});

export type CohereTextEmbeddingResponse = z.infer<
  typeof cohereTextEmbeddingResponseSchema
>;

/**
 * Call the Cohere Co.Embed API to generate an embedding for the given input.
 *
 * @see https://docs.cohere.com/reference/embed
 *
 * @example
 * const response = await callCohereEmbeddingAPI({
 *   apiKey: COHERE_API_KEY,
 *   model: "embed-english-light-v2.0",
 *   texts: [
 *     "At first, Nox didn't know what to do with the pup.",
 *     "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
 *   ],
 * });
 */
export async function callCohereEmbeddingAPI({
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
}): Promise<CohereTextEmbeddingResponse> {
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
      cohereTextEmbeddingResponseSchema
    ),
    abortSignal,
  });
}
