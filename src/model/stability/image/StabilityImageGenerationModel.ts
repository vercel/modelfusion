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
  callStabilityImageGenerationAPI,
} from "./callStabilityImageGenerationAPI.js";

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

/**
 * Create an image generation model that calls the Stability AI image generation API.
 *
 * @see https://api.stability.ai/docs#tag/v1generation/operation/textToImage
 *
 * @example
 * const imageGenerationModel = new StabilityImageGenerationModel({
 *   apiKey: STABILITY_API_KEY,
 *   model: "stable-diffusion-512-v2-1",
 *   settings: {
 *     cfgScale: 7,
 *     clipGuidancePreset: "FAST_BLUE",
 *     height: 512,
 *     width: 512,
 *     samples: 1,
 *     steps: 30,
 *   },
 * });
 *
 * const imageResponse = await imageGenerationModel.generate([
 *   { text: "the wicked witch of the west" },
 *   { text: "style of early 19th century painting", weight: 0.5 },
 * ]);
 *
 * const image = await imageGenerationModel.extractImageBase64(imageResponse);
 */
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
        callStabilityImageGenerationAPI({
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

  async extractBase64Image(
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
