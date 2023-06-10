import z from "zod";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../../internal/postToApi.js";
import { failedCohereCallResponseHandler } from "../failedCohereCallResponseHandler.js";
import { CohereTokenizerModelType } from "./CohereTokenizer.js";

export const cohereDetokenizationResponseSchema = z.object({
  text: z.string(),
  meta: z.object({
    api_version: z.object({
      version: z.string(),
    }),
  }),
});

export type CohereDetokenizationResponse = z.infer<
  typeof cohereDetokenizationResponseSchema
>;

/**
 * Call the Cohere Co.Detokenize API to detokenize a text.
 *
 * https://docs.cohere.com/reference/detokenize-1
 */
export async function callCohereDetokenizeAPI({
  baseUrl = "https://api.cohere.ai/v1",
  abortSignal,
  apiKey,
  model,
  tokens,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
  model?: CohereTokenizerModelType;
  tokens: Array<number>;
}): Promise<CohereDetokenizationResponse> {
  return postJsonToApi({
    url: `${baseUrl}/detokenize`,
    apiKey,
    body: {
      model,
      tokens,
    },
    failedResponseHandler: failedCohereCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      cohereDetokenizationResponseSchema
    ),
    abortSignal,
  });
}
