import { RunContext } from "../../../run/RunContext.js";
import { TextGenerationModel } from "../../../text/generate/TextGenerationModel.js";
import { RetryFunction } from "../../../util/retry/RetryFunction.js";
import { retryWithExponentialBackoff } from "../../../util/retry/retryWithExponentialBackoff.js";
import { throttleMaxConcurrency } from "../../../util/throttle/MaxConcurrentCallsThrottler.js";
import { ThrottleFunction } from "../../../util/throttle/ThrottleFunction.js";
import {
  HuggingFaceTextGenerationResponse,
  callHuggingFaceTextGenerationAPI,
} from "./callHuggingFaceTextGenerationAPI.js";

export type HuggingFaceTextGenerationModelSettings = {
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
};

/**
 * Create a text generation model that calls a Hugging Face Inference API Text Generation Task.
 *
 * @see https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task
 *
 * @example
 * const textGenerationModel = new HuggingFaceTextGenerationModel({
 *   apiKey: HUGGINGFACE_API_KEY,
 *   model: "tiiuae/falcon-7b",
 *   settings: { temperature: 700 },
 * });
 *
 * const response = await textGenerationModel
 *   .withSettings({ maxNewTokens: 500 })
 *   .generate("Write a short story about a robot learning to love:\n\n");
 *
 * const text = await textGenerationModel.extractText(response);
 */
export class HuggingFaceTextGenerationModel
  implements TextGenerationModel<string, HuggingFaceTextGenerationResponse>
{
  readonly provider = "huggingface";

  readonly baseUrl?: string;
  readonly apiKey: string;
  readonly model: string;
  readonly settings: HuggingFaceTextGenerationModelSettings;

  readonly retry: RetryFunction;
  readonly throttle: ThrottleFunction;

  constructor({
    baseUrl,
    apiKey,
    model,
    settings = {},
    retry = retryWithExponentialBackoff(),
    throttle = throttleMaxConcurrency({ maxConcurrentCalls: 5 }),
  }: {
    baseUrl?: string;
    apiKey: string;
    model: string;
    settings?: HuggingFaceTextGenerationModelSettings;
    retry?: RetryFunction;
    throttle?: ThrottleFunction;
  }) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.model = model;
    this.settings = settings;

    this.retry = retry;
    this.throttle = throttle;
  }

  async generate(
    input: string,
    context?: RunContext
  ): Promise<HuggingFaceTextGenerationResponse> {
    return this.retry(async () =>
      this.throttle(async () =>
        callHuggingFaceTextGenerationAPI({
          baseUrl: this.baseUrl,
          abortSignal: context?.abortSignal,
          apiKey: this.apiKey,
          inputs: input,
          model: this.model,
          ...this.settings,
          options: this.settings.options ?? {
            useCache: true,
            waitForModel: true,
          },
        })
      )
    );
  }

  async extractText(
    rawOutput: HuggingFaceTextGenerationResponse
  ): Promise<string> {
    return rawOutput[0].generated_text;
  }

  withSettings(additionalSettings: HuggingFaceTextGenerationModelSettings) {
    return new HuggingFaceTextGenerationModel({
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      model: this.model,
      settings: Object.assign({}, this.settings, additionalSettings),
      retry: this.retry,
      throttle: this.throttle,
    });
  }
}
