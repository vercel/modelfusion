import z from "zod";
import { AbstractTextGenerationModel } from "../../model/text-generation/AbstractTextGenerationModel.js";
import { TextGenerationModelSettings } from "../../model/text-generation/TextGenerationModel.js";
import { RunContext } from "../../run/RunContext.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../util/api/postToApi.js";
import { failedHuggingFaceCallResponseHandler } from "./failedHuggingFaceCallResponseHandler.js";

export interface HuggingFaceTextGenerationModelSettings
  extends TextGenerationModelSettings {
  model: string;

  baseUrl?: string;
  apiKey?: string;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;

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
}

/**
 * Create a text generation model that calls a Hugging Face Inference API Text Generation Task.
 *
 * @see https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task
 *
 * @example
 * const textGenerationModel = new HuggingFaceTextGenerationModel({
 *   model: "tiiuae/falcon-7b",
 *   temperature: 0.7,
 *   maxTokens: 500,
 *   retry: retryWithExponentialBackoff({ maxTries: 5 }),
 * });
 *
 * const text = await model.generateText(
 *   "Write a short story about a robot learning to love:\n\n"
 * );
 */
export class HuggingFaceTextGenerationModel extends AbstractTextGenerationModel<
  string,
  HuggingFaceTextGenerationResponse,
  HuggingFaceTextGenerationModelSettings
> {
  constructor(settings: HuggingFaceTextGenerationModelSettings) {
    super({
      settings,
      extractText: (response) => response[0].generated_text,
      generateResponse: (prompt, response) => this.callAPI(prompt, response),
    });
  }

  readonly provider = "huggingface";
  get modelName() {
    return this.settings.model;
  }

  private get apiKey() {
    const apiKey = this.settings.apiKey ?? process.env.HUGGINGFACE_API_KEY;

    if (apiKey == null) {
      throw new Error(
        "No Hugging Face API key provided. Pass it in the constructor or set the HUGGINGFACE_API_KEY environment variable."
      );
    }

    return apiKey;
  }

  async callAPI(
    prompt: string,
    context?: RunContext
  ): Promise<HuggingFaceTextGenerationResponse> {
    return callWithRetryAndThrottle({
      retry: this.settings.retry,
      throttle: this.settings.throttle,
      call: async () =>
        callHuggingFaceTextGenerationAPI({
          abortSignal: context?.abortSignal,
          apiKey: this.apiKey,
          inputs: prompt,
          ...this.settings,
          options: this.settings.options ?? {
            useCache: true,
            waitForModel: true,
          },
        }),
    });
  }

  withSettings(
    additionalSettings: Partial<HuggingFaceTextGenerationModelSettings>
  ) {
    return new HuggingFaceTextGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const huggingFaceTextGenerationResponseSchema = z.array(
  z.object({
    generated_text: z.string(),
  })
);

export type HuggingFaceTextGenerationResponse = z.infer<
  typeof huggingFaceTextGenerationResponseSchema
>;

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
