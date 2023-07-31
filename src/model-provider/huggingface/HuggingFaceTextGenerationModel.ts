import z from "zod";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { FunctionOptions } from "../../model-function/FunctionOptions.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../util/api/postToApi.js";
import { failedHuggingFaceCallResponseHandler } from "./HuggingFaceError.js";
import { PromptMapping } from "../../prompt/PromptMapping.js";
import { PromptMappingTextGenerationModel } from "../../prompt/PromptMappingTextGenerationModel.js";

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
export class HuggingFaceTextGenerationModel
  extends AbstractModel<HuggingFaceTextGenerationModelSettings>
  implements
    TextGenerationModel<
      string,
      HuggingFaceTextGenerationResponse,
      undefined,
      HuggingFaceTextGenerationModelSettings
    >
{
  constructor(settings: HuggingFaceTextGenerationModelSettings) {
    super({ settings });
  }

  readonly provider = "huggingface";
  get modelName() {
    return this.settings.model;
  }

  readonly contextWindowSize = undefined;
  readonly tokenizer = undefined;

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
    options?: FunctionOptions<HuggingFaceTextGenerationModelSettings>
  ): Promise<HuggingFaceTextGenerationResponse> {
    const run = options?.run;
    const settings = options?.settings;

    const callSettings = Object.assign(
      {
        apiKey: this.apiKey,
        options: {
          useCache: true,
          waitForModel: true,
        },
      },
      this.settings,
      settings,
      {
        abortSignal: run?.abortSignal,
        inputs: prompt,
      }
    );

    return callWithRetryAndThrottle({
      retry: this.settings.retry,
      throttle: this.settings.throttle,
      call: async () => callHuggingFaceTextGenerationAPI(callSettings),
    });
  }

  readonly countPromptTokens = undefined;

  generateTextResponse(
    prompt: string,
    options?: FunctionOptions<HuggingFaceTextGenerationModelSettings>
  ) {
    return this.callAPI(prompt, options);
  }

  extractText(response: HuggingFaceTextGenerationResponse): string {
    return response[0].generated_text;
  }

  generateDeltaStreamResponse = undefined;
  extractTextDelta = undefined;

  mapPrompt<INPUT_PROMPT>(
    promptMapping: PromptMapping<INPUT_PROMPT, string>
  ): PromptMappingTextGenerationModel<
    INPUT_PROMPT,
    string,
    HuggingFaceTextGenerationResponse,
    undefined,
    HuggingFaceTextGenerationModelSettings,
    this
  > {
    return new PromptMappingTextGenerationModel({
      model: this, // stop tokens are not supported by this model
      promptMapping,
    });
  }

  withSettings(
    additionalSettings: Partial<HuggingFaceTextGenerationModelSettings>
  ) {
    return new HuggingFaceTextGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }

  withMaxCompletionTokens(maxCompletionTokens: number): this {
    return this.withSettings({ maxNewTokens: maxCompletionTokens });
  }

  withStopTokens(): this {
    // stop tokens are not supported by the HuggingFace API
    return this;
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
async function callHuggingFaceTextGenerationAPI({
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
