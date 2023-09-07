import { z } from "zod";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { ModelFunctionOptions } from "../../model-function/ModelFunctionOptions.js";
import { ApiConfiguration } from "../../model-function/ApiConfiguration.js";
import {
  ImageGenerationModel,
  ImageGenerationModelSettings,
} from "../../model-function/generate-image/ImageGenerationModel.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../util/api/postToApi.js";
import { failedStabilityCallResponseHandler } from "./StabilityError.js";
import { StabilityAIApiConfiguration } from "./StabilityApiConfiguration.js";

/**
 * Create an image generation model that calls the Stability AI image generation API.
 *
 * @see https://api.stability.ai/docs#tag/v1generation/operation/textToImage
 *
 * @example
 * const image = await generateImage(
 *   new StabilityImageGenerationModel({
 *     model: "stable-diffusion-512-v2-1",
 *     cfgScale: 7,
 *     clipGuidancePreset: "FAST_BLUE",
 *     height: 512,
 *     width: 512,
 *     samples: 1,
 *     steps: 30,
 *   })
 *   [
 *     { text: "the wicked witch of the west" },
 *     { text: "style of early 19th century painting", weight: 0.5 },
 *   ]
 * );
 */
export class StabilityImageGenerationModel
  extends AbstractModel<StabilityImageGenerationModelSettings>
  implements
    ImageGenerationModel<
      StabilityImageGenerationPrompt,
      StabilityImageGenerationResponse,
      StabilityImageGenerationModelSettings
    >
{
  constructor(settings: StabilityImageGenerationModelSettings) {
    super({ settings });
  }

  readonly provider = "stability" as const;

  get modelName() {
    return this.settings.model;
  }

  async callAPI(
    input: StabilityImageGenerationPrompt,
    options?: ModelFunctionOptions<StabilityImageGenerationModelSettings>
  ): Promise<StabilityImageGenerationResponse> {
    const run = options?.run;
    const settings = options?.settings;

    const combinedSettings = {
      ...this.settings,
      ...settings,
    };

    const callSettings = {
      // Copied settings:
      ...combinedSettings,

      // other settings:
      abortSignal: run?.abortSignal,
      engineId: this.settings.model,
      textPrompts: input,
    };

    return callWithRetryAndThrottle({
      retry: callSettings.api?.retry,
      throttle: callSettings.api?.throttle,
      call: async () => callStabilityImageGenerationAPI(callSettings),
    });
  }

  get settingsForEvent(): Partial<StabilityImageGenerationModelSettings> {
    const eventSettingProperties = [
      "baseUrl",
      "height",
      "width",
      "cfgScale",
      "clipGuidancePreset",
      "sampler",
      "samples",
      "seed",
      "steps",
      "stylePreset",
    ];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  generateImageResponse(
    prompt: StabilityImageGenerationPrompt,
    options?: ModelFunctionOptions<StabilityImageGenerationModelSettings>
  ) {
    return this.callAPI(prompt, options);
  }

  extractBase64Image(response: StabilityImageGenerationResponse): string {
    return response.artifacts[0].base64;
  }

  withSettings(additionalSettings: StabilityImageGenerationModelSettings) {
    return new StabilityImageGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

export interface StabilityImageGenerationModelSettings
  extends ImageGenerationModelSettings {
  api?: ApiConfiguration;

  model: string;

  height?: number;
  width?: number;
  cfgScale?: number;
  clipGuidancePreset?: string;
  sampler?: StabilityImageGenerationSampler;
  samples?: number;
  seed?: number;
  steps?: number;
  stylePreset?: StabilityImageGenerationStylePreset;
}

const stabilityImageGenerationResponseSchema = z.object({
  artifacts: z.array(
    z.object({
      base64: z.string(),
      seed: z.number(),
      finishReason: z.enum(["SUCCESS", "ERROR", "CONTENT_FILTERED"]),
    })
  ),
});

export type StabilityImageGenerationResponse = z.infer<
  typeof stabilityImageGenerationResponseSchema
>;

export type StabilityImageGenerationStylePreset =
  | "enhance"
  | "anime"
  | "photographic"
  | "digital-art"
  | "comic-book"
  | "fantasy-art"
  | "line-art"
  | "analog-film"
  | "neon-punk"
  | "isometric"
  | "low-poly"
  | "origami"
  | "modeling-compound"
  | "cinematic"
  | "3d-model"
  | "pixel-art"
  | "tile-texture";

export type StabilityImageGenerationSampler =
  | "DDIM"
  | "DDPM"
  | "K_DPMPP_2M"
  | "K_DPMPP_2S_ANCESTRAL"
  | "K_DPM_2"
  | "K_DPM_2_ANCESTRAL"
  | "K_EULER"
  | "K_EULER_ANCESTRAL"
  | "K_HEUN"
  | "K_LMS";

export type StabilityImageGenerationPrompt = Array<{
  text: string;
  weight?: number;
}>;

async function callStabilityImageGenerationAPI({
  api = new StabilityAIApiConfiguration(),
  abortSignal,
  engineId,
  height,
  width,
  textPrompts,
  cfgScale,
  clipGuidancePreset,
  sampler,
  samples,
  seed,
  steps,
  stylePreset,
}: {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  engineId: string;
  height?: number;
  width?: number;
  textPrompts: StabilityImageGenerationPrompt;
  cfgScale?: number;
  clipGuidancePreset?: string;
  sampler?: StabilityImageGenerationSampler;
  samples?: number;
  seed?: number;
  steps?: number;
  stylePreset?: StabilityImageGenerationStylePreset;
}): Promise<StabilityImageGenerationResponse> {
  return postJsonToApi({
    url: api.assembleUrl(`/generation/${engineId}/text-to-image`),
    headers: api.headers,
    body: {
      height,
      width,
      text_prompts: textPrompts,
      cfg_scale: cfgScale,
      clip_guidance_preset: clipGuidancePreset,
      sampler,
      samples,
      seed,
      steps,
      style_preset: stylePreset,
    },
    failedResponseHandler: failedStabilityCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      stabilityImageGenerationResponseSchema
    ),
    abortSignal,
  });
}
