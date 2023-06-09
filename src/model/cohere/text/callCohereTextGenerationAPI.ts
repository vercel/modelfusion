import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../../internal/postToApi.js";
import { failedCohereCallResponseHandler } from "../internal/failedCohereCallResponseHandler.js";
import { CohereTextGenerationModelType } from "./CohereTextGenerationModel.js";
import {
  CohereTextGenerationResponse,
  cohereTextGenerationResponseSchema,
} from "./CohereTextGenerationResponse.js";

/**
 * Call the Cohere Co.Generate API to generate a text completion for the given prompt.
 *
 * @see https://docs.cohere.com/reference/generate
 *
 * @example
 * const response = await callCohereTextGenerationAPI({
 *   apiKey: COHERE_API_KEY,
 *   model: "command-nightly",
 *   prompt: "Write a short story about a robot learning to love:\n\n",
 *   temperature: 0.7,
 *   maxTokens: 500,
 * });
 *
 * console.log(response.generations[0].text);
 */
export async function callCohereTextGenerationAPI({
  baseUrl = "https://api.cohere.ai/v1",
  abortSignal,
  apiKey,
  model,
  prompt,
  numGenerations,
  maxTokens,
  temperature,
  k,
  p,
  frequencyPenalty,
  presencePenalty,
  endSequences,
  stopSequences,
  returnLikelihoods,
  logitBias,
  truncate,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
  model: CohereTextGenerationModelType;
  prompt: string;
  numGenerations?: number;
  maxTokens?: number;
  temperature?: number;
  k?: number;
  p?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  endSequences?: string[];
  stopSequences?: string[];
  returnLikelihoods?: "GENERATION" | "ALL" | "NONE";
  logitBias?: Record<string, number>;
  truncate?: "NONE" | "START" | "END";
}): Promise<CohereTextGenerationResponse> {
  return postJsonToApi({
    url: `${baseUrl}/generate`,
    apiKey,
    body: {
      model,
      prompt,
      num_generations: numGenerations,
      max_tokens: maxTokens,
      temperature,
      k,
      p,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      end_sequences: endSequences,
      stop_sequences: stopSequences,
      return_likelihoods: returnLikelihoods,
      logit_bias: logitBias,
      truncate,
    },
    failedResponseHandler: failedCohereCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      cohereTextGenerationResponseSchema
    ),
    abortSignal,
  });
}
