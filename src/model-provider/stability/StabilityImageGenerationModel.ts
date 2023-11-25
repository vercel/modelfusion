import { z } from "zod";
import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi.js";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { PromptFormat } from "../../model-function/PromptFormat.js";
import {
  ImageGenerationModel,
  ImageGenerationModelSettings,
} from "../../model-function/generate-image/ImageGenerationModel.js";
import { PromptFormatImageGenerationModel } from "../../model-function/generate-image/PromptFormatImageGenerationModel.js";
import { StabilityApiConfiguration } from "./StabilityApiConfiguration.js";
import { failedStabilityCallResponseHandler } from "./StabilityError.js";
import {
  StabilityImageGenerationPrompt,
  mapBasicPromptToStabilityFormat,
} from "./StabilityImageGenerationPrompt.js";

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
  extends AbstractModel<StabilityImageGenerationSettings>
  implements
    ImageGenerationModel<
      StabilityImageGenerationPrompt,
      StabilityImageGenerationSettings
    >
{
  constructor(settings: StabilityImageGenerationSettings) {
    super({ settings });
  }

  readonly provider = "stability" as const;

  get modelName() {
    return this.settings.model;
  }

  async callAPI(
    input: StabilityImageGenerationPrompt,
    options?: FunctionOptions
  ): Promise<StabilityImageGenerationResponse> {
    return callWithRetryAndThrottle({
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () =>
        callStabilityImageGenerationAPI({
          ...this.settings,
          abortSignal: options?.run?.abortSignal,
          engineId: this.settings.model,
          textPrompts: input,
        }),
    });
  }

  get settingsForEvent(): Partial<StabilityImageGenerationSettings> {
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

  async doGenerateImage(
    prompt: StabilityImageGenerationPrompt,
    options?: FunctionOptions
  ) {
    const response = await this.callAPI(prompt, options);

    return {
      response,
      base64Image: response.artifacts[0].base64,
    };
  }

  withTextPrompt() {
    return this.withPromptFormat(mapBasicPromptToStabilityFormat());
  }

  withPromptFormat<INPUT_PROMPT>(
    promptFormat: PromptFormat<INPUT_PROMPT, StabilityImageGenerationPrompt>
  ): PromptFormatImageGenerationModel<
    INPUT_PROMPT,
    StabilityImageGenerationPrompt,
    StabilityImageGenerationSettings,
    this
  > {
    return new PromptFormatImageGenerationModel({
      model: this,
      promptFormat,
    });
  }

  withSettings(additionalSettings: StabilityImageGenerationSettings) {
    return new StabilityImageGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const stabilityImageGenerationModels = [
  "stable-diffusion-v1-5",
  "stable-diffusion-512-v2-1",
  "stable-diffusion-xl-1024-v0-9",
  "stable-diffusion-xl-1024-v1-0",
] as const;

export type StabilityImageGenerationModelType =
  | (typeof stabilityImageGenerationModels)[number]
  // string & {} is used to enable auto-completion of literals
  // while also allowing strings:
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});

export interface StabilityImageGenerationSettings
  extends ImageGenerationModelSettings {
  api?: ApiConfiguration;

  model: StabilityImageGenerationModelType;

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

async function callStabilityImageGenerationAPI({
  api = new StabilityApiConfiguration(),
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
