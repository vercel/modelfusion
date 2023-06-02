import { ImageGenerationModel } from "../../../image/generate/ImageGenerationModel.js";
import { RunContext } from "../../../run/RunContext.js";
import { RetryFunction } from "../../../util/retry/RetryFunction.js";
import { retryWithExponentialBackoff } from "../../../util/retry/retryWithExponentialBackoff.js";
import { throttleMaxConcurrency } from "../../../util/throttle/MaxConcurrentCallsThrottler.js";
import { ThrottleFunction } from "../../../util/throttle/ThrottleFunction.js";
import {
  StabilityImageGenerationPrompt,
  StabilityImageGenerationResponse,
  StabilityImageGenerationSampler,
  StabilityImageGenerationStylePreset,
  generateStabilityImage,
} from "./generateStabilityImage.js";

export type StabilityImageGenerationModelSettings = {
  height?: number;
  width?: number;
  cfgScale?: number;
  clipGuidancePreset?: string;
  sampler?: StabilityImageGenerationSampler;
  samples?: number;
  seed?: number;
  steps?: number;
  stylePreset?: StabilityImageGenerationStylePreset;
};

export class StabilityImageGenerationModel
  implements
    ImageGenerationModel<
      StabilityImageGenerationPrompt,
      StabilityImageGenerationResponse
    >
{
  readonly provider = "stability";

  readonly baseUrl?: string;
  readonly apiKey: string;

  /**
   * The Stability engineId is used as the model.
   */
  readonly model: string;

  readonly settings: StabilityImageGenerationModelSettings;

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
    settings?: StabilityImageGenerationModelSettings;
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
    input: StabilityImageGenerationPrompt,
    context?: RunContext
  ): Promise<StabilityImageGenerationResponse> {
    return this.retry(async () =>
      this.throttle(async () =>
        generateStabilityImage({
          baseUrl: this.baseUrl,
          abortSignal: context?.abortSignal,
          apiKey: this.apiKey,
          engineId: this.model,
          textPrompts: input,
          ...this.settings,
        })
      )
    );
  }

  async extractImageBase64(
    rawOutput: StabilityImageGenerationResponse
  ): Promise<string> {
    return rawOutput.artifacts[0].base64;
  }

  withSettings(additionalSettings: StabilityImageGenerationModelSettings) {
    return new StabilityImageGenerationModel({
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      model: this.model,
      settings: Object.assign({}, this.settings, additionalSettings),
      retry: this.retry,
      throttle: this.throttle,
    });
  }
}
