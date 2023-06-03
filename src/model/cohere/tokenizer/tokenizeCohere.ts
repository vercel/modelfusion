import z from "zod";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../../internal/postToApi.js";
import { failedCohereCallResponseHandler } from "../internal/failedCohereCallResponseHandler.js";
import { CohereTokenizerModelType } from "./CohereTokenizer.js";

export const cohereTokenizationResponseSchema = z.object({
  tokens: z.array(z.number()),
  token_strings: z.array(z.string()),
  meta: z.object({
    api_version: z.object({
      version: z.string(),
    }),
  }),
});

export type CohereTokenizationResponse = z.infer<
  typeof cohereTokenizationResponseSchema
>;

/**
 * Call the Cohere Co.Tokenize API to tokenize a text.
 *
 * https://docs.cohere.com/reference/tokenize
 */
export async function tokenizeCohere({
  baseUrl = "https://api.cohere.ai/v1",
  abortSignal,
  apiKey,
  model,
  text,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
  model?: CohereTokenizerModelType;
  text: string;
}): Promise<CohereTokenizationResponse> {
  return postJsonToApi({
    url: `${baseUrl}/tokenize`,
    apiKey,
    body: {
      model,
      text,
    },
    failedResponseHandler: failedCohereCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      cohereTokenizationResponseSchema
    ),
    abortSignal,
  });
}
