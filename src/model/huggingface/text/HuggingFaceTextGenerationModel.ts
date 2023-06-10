import { AbstractTextGenerationModel } from "../../../internal/AbstractTextGenerationModel.js";
import { RunContext } from "../../../run/RunContext.js";
import { BaseTextGenerationModelSettings } from "../../../text/generate/TextGenerationModel.js";
import { RetryFunction } from "../../../util/retry/RetryFunction.js";
import { retryWithExponentialBackoff } from "../../../util/retry/retryWithExponentialBackoff.js";
import { throttleMaxConcurrency } from "../../../util/throttle/MaxConcurrentCallsThrottler.js";
import { ThrottleFunction } from "../../../util/throttle/ThrottleFunction.js";
import { HuggingFaceTextGenerationResponse } from "./HuggingFaceTextGenerationResponse.js";
import { callHuggingFaceTextGenerationAPI } from "./callHuggingFaceTextGenerationAPI.js";

export type HuggingFaceTextGenerationModelSettings =
  BaseTextGenerationModelSettings & {
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
  };

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
  get model() {
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

  private get retry() {
    return this.settings.retry ?? retryWithExponentialBackoff();
  }

  private get throttle() {
    return (
      this.settings.throttle ??
      throttleMaxConcurrency({ maxConcurrentCalls: 5 })
    );
  }

  async callAPI(
    prompt: string,
    context?: RunContext
  ): Promise<HuggingFaceTextGenerationResponse> {
    return this.retry(async () =>
      this.throttle(async () =>
        callHuggingFaceTextGenerationAPI({
          abortSignal: context?.abortSignal,
          apiKey: this.apiKey,
          inputs: prompt,
          ...this.settings,
          options: this.settings.options ?? {
            useCache: true,
            waitForModel: true,
          },
        })
      )
    );
  }

  withSettings(
    additionalSettings: Partial<HuggingFaceTextGenerationModelSettings>
  ) {
    return new HuggingFaceTextGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}
