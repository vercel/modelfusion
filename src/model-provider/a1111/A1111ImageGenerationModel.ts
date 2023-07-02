import { z } from "zod";
import { FunctionOptions } from "../../model/FunctionOptions.js";
import { AbstractImageGenerationModel } from "../../model/image-generation/AbstractImageGenerationModel.js";
import { ImageGenerationModelSettings } from "../../model/image-generation/ImageGenerationModel.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../util/api/postToApi.js";
import { failedA1111CallResponseHandler } from "./failedA1111CallResponseHandler.js";

/**
 * Create an image generation model that calls the AUTOMATIC1111 Stable Diffusion Web UI API.
 *
 * @see https://github.com/AUTOMATIC1111/stable-diffusion-webui
 */
export class A1111ImageGenerationModel extends AbstractImageGenerationModel<
  A111ImageGenerationPrompt,
  A1111ImageGenerationResponse,
  A1111ImageGenerationModelSettings
> {
  constructor(settings: A1111ImageGenerationModelSettings) {
    super({
      settings,
      extractBase64Image: (response) => response.images[0],
      generateResponse: (prompt, options) => this.callAPI(prompt, options),
    });
  }

  readonly provider = "a1111" as const;

  get modelName() {
    return this.settings.model;
  }

  async callAPI(
    input: A111ImageGenerationPrompt,
    options?: FunctionOptions<A1111ImageGenerationModelSettings>
  ): Promise<A1111ImageGenerationResponse> {
    const run = options?.run;
    const settings = options?.settings;

    const callSettings = Object.assign(this.settings, settings, {
      abortSignal: run?.abortSignal,
      engineId: this.settings.model,
      prompt: input.prompt,
    });

    return callWithRetryAndThrottle({
      retry: this.settings.retry,
      throttle: this.settings.throttle,
      call: async () => callA1111ImageGenerationAPI(callSettings),
    });
  }

  withSettings(additionalSettings: A1111ImageGenerationModelSettings) {
    return new A1111ImageGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

export interface A1111ImageGenerationModelSettings
  extends ImageGenerationModelSettings {
  model: string;

  baseUrl?: string;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;
}

const a1111ImageGenerationResponseSchema = z.object({
  images: z.array(z.string()),
  parameters: z.object({}),
  info: z.string(),
});

export type A1111ImageGenerationResponse = z.infer<
  typeof a1111ImageGenerationResponseSchema
>;

export type A111ImageGenerationPrompt = {
  prompt: string;
};

async function callA1111ImageGenerationAPI({
  baseUrl = "http://127.0.0.1:7860",
  abortSignal,
  height,
  width,
  prompt,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  height?: number;
  width?: number;
  prompt: String;
}): Promise<A1111ImageGenerationResponse> {
  return postJsonToApi({
    url: `${baseUrl}/sdapi/v1/txt2img`,
    body: {
      height,
      width,
      prompt,
    },
    failedResponseHandler: failedA1111CallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      a1111ImageGenerationResponseSchema
    ),
    abortSignal,
  });
}
