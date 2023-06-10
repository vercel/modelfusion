import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../../internal/postToApi.js";
import { failedHuggingFaceCallResponseHandler } from "../internal/failedHuggingFaceCallResponseHandler.js";
import {
  HuggingFaceTextGenerationResponse,
  huggingFaceTextGenerationResponseSchema,
} from "./HuggingFaceTextGenerationResponse.js";

/**
 * Call a Hugging Face Inference API Text Generation Task to generate a text completion for the given prompt.
 *
 * @see https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task
 *
 * @example
 * const response = await callHuggingFaceTextGenerationAPI({
 *   apiKey: HUGGINGFACE_API_KEY,
 *   model: "tiiuae/falcon-7b",
 *   inputs: "Write a short story about a robot learning to love:\n\n",
 *   temperature: 700,
 *   maxNewTokens: 500,
 *   options: {
 *     waitForModel: true,
 *   },
 * });
 *
 * console.log(response[0].generated_text);
 */
export async function callHuggingFaceTextGenerationAPI({
  baseUrl = "https://api-inference.huggingface.co/models",
  abortSignal,
  apiKey,
  model,
  inputs,
  topK,
  topP,
  temperature,
  repetitionPenalty,
  maxNewTokens,
  maxTime,
  numReturnSequences,
  doSample,
  options,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
  model: string;
  inputs: string;
  topK?: number;
  topP?: number;
  temperature?: number;
  repetitionPenalty?: number;
  maxNewTokens?: number;
  maxTime?: number;
  numReturnSequences?: number;
  doSample?: boolean;
  options?: {
    useCache?: boolean;
    waitForModel?: boolean;
  };
}): Promise<HuggingFaceTextGenerationResponse> {
  return postJsonToApi({
    url: `${baseUrl}/${model}`,
    apiKey,
    body: {
      inputs,
      top_k: topK,
      top_p: topP,
      temperature,
      repetition_penalty: repetitionPenalty,
      max_new_tokens: maxNewTokens,
      max_time: maxTime,
      num_return_sequences: numReturnSequences,
      do_sample: doSample,
      options: options
        ? {
            use_cache: options?.useCache,
            wait_for_model: options?.waitForModel,
          }
        : undefined,
    },
    failedResponseHandler: failedHuggingFaceCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      huggingFaceTextGenerationResponseSchema
    ),
    abortSignal,
  });
}
