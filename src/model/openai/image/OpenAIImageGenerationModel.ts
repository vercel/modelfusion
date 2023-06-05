import { ImageGenerationModel } from "../../../image/generate/ImageGenerationModel.js";
import { RunContext } from "../../../run/RunContext.js";
import { RetryFunction } from "../../../util/retry/RetryFunction.js";
import { retryWithExponentialBackoff } from "../../../util/retry/retryWithExponentialBackoff.js";
import { throttleMaxConcurrency } from "../../../util/throttle/MaxConcurrentCallsThrottler.js";
import { ThrottleFunction } from "../../../util/throttle/ThrottleFunction.js";
import {
  OpenAIImageGenerationBase64JsonResponse,
  callOpenAIImageGenerationAPI,
} from "./callOpenAIImageGenerationAPI.js";

export type OpenAIImageGenerationModelSettings = {
  n?: number;
  size?: "256x256" | "512x512" | "1024x1024";
};

/**
 * Create an image generation model that calls the OpenAI AI image creation API.
 *
 * @see https://platform.openai.com/docs/api-reference/images/create
 *
 * @example
 * const imageGenerationModel = new OpenAIImageGenerationModel({
 *   apiKey: OPENAI_API_KEY,
 *   settings: {
 *     size: "512x512",
 *   },
 * });
 *
 * const imageResponse = await imageGenerationModel.generate(
 *   "the wicked witch of the west in the style of early 19th century painting"
 * );
 *
 * const image = await imageGenerationModel.extractImageBase64(imageResponse);
 */
export class OpenAIImageGenerationModel
  implements
    ImageGenerationModel<string, OpenAIImageGenerationBase64JsonResponse>
{
  readonly provider = "openai";

  readonly baseUrl?: string;
  readonly apiKey: string;

  readonly model = null; // OpenAI doesn't have a concept of models for image generation
  readonly settings: OpenAIImageGenerationModelSettings;

  readonly retry: RetryFunction;
  readonly throttle: ThrottleFunction;

  constructor({
    baseUrl,
    apiKey,
    settings = {},
    retry = retryWithExponentialBackoff(),
    throttle = throttleMaxConcurrency({ maxConcurrentCalls: 5 }),
  }: {
    baseUrl?: string;
    apiKey: string;
    settings?: OpenAIImageGenerationModelSettings;
    retry?: RetryFunction;
    throttle?: ThrottleFunction;
  }) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.settings = settings;

    this.retry = retry;
    this.throttle = throttle;
  }

  async generate(
    input: string,
    context?: RunContext
  ): Promise<OpenAIImageGenerationBase64JsonResponse> {
    return this.retry(async () =>
      this.throttle(async () =>
        callOpenAIImageGenerationAPI({
          baseUrl: this.baseUrl,
          abortSignal: context?.abortSignal,
          apiKey: this.apiKey,
          prompt: input,
          responseFormat:
            callOpenAIImageGenerationAPI.responseFormat.base64Json,
          ...this.settings,
        })
      )
    );
  }

  async extractBase64Image(
    rawOutput: OpenAIImageGenerationBase64JsonResponse
  ): Promise<string> {
    return rawOutput.data[0].b64_json;
  }

  withSettings(additionalSettings: OpenAIImageGenerationBase64JsonResponse) {
    return new OpenAIImageGenerationModel({
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      settings: Object.assign({}, this.settings, additionalSettings),
      retry: this.retry,
      throttle: this.throttle,
    });
  }
}
