import { z } from "zod";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { ModelFunctionOptions } from "../../model-function/ModelFunctionOptions.js";
import {
  ImageGenerationModel,
  ImageGenerationModelSettings,
} from "../../model-function/generate-image/ImageGenerationModel.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../util/api/postToApi.js";
import { failedAutomatic1111CallResponseHandler } from "./Automatic1111Error.js";

/**
 * Create an image generation model that calls the AUTOMATIC1111 Stable Diffusion Web UI API.
 *
 * @see https://github.com/AUTOMATIC1111/stable-diffusion-webui
 */
export class Automatic1111ImageGenerationModel
  extends AbstractModel<Automatic1111ImageGenerationModelSettings>
  implements
    ImageGenerationModel<
      A111ImageGenerationPrompt,
      Automatic1111ImageGenerationResponse,
      Automatic1111ImageGenerationModelSettings
    >
{
  constructor(settings: Automatic1111ImageGenerationModelSettings) {
    super({ settings });
  }

  readonly provider = "Automatic1111" as const;

  get modelName() {
    return this.settings.model;
  }

  async callAPI(
    input: A111ImageGenerationPrompt,
    options?: ModelFunctionOptions<Automatic1111ImageGenerationModelSettings>
  ): Promise<Automatic1111ImageGenerationResponse> {
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
      call: async () => callAutomatic1111ImageGenerationAPI(callSettings),
    });
  }

  generateImageResponse(
    prompt: A111ImageGenerationPrompt,
    options?: ModelFunctionOptions<Automatic1111ImageGenerationModelSettings>
  ) {
    return this.callAPI(prompt, options);
  }

  extractBase64Image(response: Automatic1111ImageGenerationResponse): string {
    return response.images[0];
  }

  withSettings(additionalSettings: Automatic1111ImageGenerationModelSettings) {
    return new Automatic1111ImageGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

export interface Automatic1111ImageGenerationModelSettings
  extends ImageGenerationModelSettings {
  baseUrl?: string;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;

  model: string;
  height?: number;
  width?: number;
  sampler?: string;
  steps?: number;
}

const Automatic1111ImageGenerationResponseSchema = z.object({
  images: z.array(z.string()),
  parameters: z.object({}),
  info: z.string(),
});

export type Automatic1111ImageGenerationResponse = z.infer<
  typeof Automatic1111ImageGenerationResponseSchema
>;

export type A111ImageGenerationPrompt = {
  prompt: string;
  negativePrompt?: string;
  seed?: number;
};

async function callAutomatic1111ImageGenerationAPI({
  baseUrl = "http://127.0.0.1:7860",
  abortSignal,
  height,
  width,
  prompt,
  negativePrompt,
  sampler,
  steps,
  seed,
  model,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  height?: number;
  width?: number;
  prompt: string;
  negativePrompt?: string;
  sampler?: string;
  steps?: number;
  seed?: number;
  model?: string;
}): Promise<Automatic1111ImageGenerationResponse> {
  return postJsonToApi({
    url: `${baseUrl}/sdapi/v1/txt2img`,
    body: {
      height,
      width,
      prompt,
      negative_prompt: negativePrompt,
      sampler_index: sampler,
      steps,
      seed,
      override_settings: {
        sd_model_checkpoint: model,
      },
    },
    failedResponseHandler: failedAutomatic1111CallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      Automatic1111ImageGenerationResponseSchema
    ),
    abortSignal,
  });
}
