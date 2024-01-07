import { z } from "zod";
import { FunctionCallOptions } from "../../core/FunctionOptions.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi.js";
import { zodSchema } from "../../core/schema/ZodSchema.js";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { PromptTemplate } from "../../model-function/PromptTemplate.js";
import {
  ImageGenerationModel,
  ImageGenerationModelSettings,
} from "../../model-function/generate-image/ImageGenerationModel.js";
import { PromptTemplateImageGenerationModel } from "../../model-function/generate-image/PromptTemplateImageGenerationModel.js";
import { StabilityApiConfiguration } from "./StabilityApiConfiguration.js";
import { failedStabilityCallResponseHandler } from "./StabilityError.js";
import {
  StabilityImageGenerationPrompt,
  mapBasicPromptToStabilityFormat,
} from "./StabilityImageGenerationPrompt.js";

const stabilityImageGenerationModels = [
  "stable-diffusion-v1-6",
  "stable-diffusion-xl-1024-v1-0",
] as const;

export type StabilityImageGenerationModelType =
  | (typeof stabilityImageGenerationModels)[number]
  // string & {} is used to enable auto-completion of literals
  // while also allowing strings:
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});

export type StabilityImageGenerationStylePreset =
  | "3d-model"
  | "analog-film"
  | "anime"
  | "cinematic"
  | "comic-book"
  | "digital-art"
  | "enhance"
  | "fantasy-art"
  | "isometric"
  | "line-art"
  | "low-poly"
  | "modeling-compound"
  | "neon-punk"
  | "origami"
  | "photographic"
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

export type StabilityClipGuidancePreset =
  | "FAST_BLUE"
  | "FAST_GREEN"
  | "NONE"
  | "SIMPLE"
  | "SLOW"
  | "SLOWER"
  | "SLOWEST";

export interface StabilityImageGenerationSettings
  extends ImageGenerationModelSettings {
  api?: ApiConfiguration;

  model: StabilityImageGenerationModelType;

  height?: number;
  width?: number;

  /**
   * How strictly the diffusion process adheres to the prompt text (higher values keep your image closer to your prompt)
   */
  cfgScale?: number;

  clipGuidancePreset?: StabilityClipGuidancePreset;

  /**
   * Which sampler to use for the diffusion process.
   * If this value is omitted we'll automatically select an appropriate sampler for you.
   */
  sampler?: StabilityImageGenerationSampler;

  /**
   * Random noise seed (omit this option or use 0 for a random seed).
   */
  seed?: number;

  /**
   * Number of diffusion steps to run.
   */
  steps?: number;

  /**
   * Pass in a style preset to guide the image model towards a particular style.
   */
  stylePreset?: StabilityImageGenerationStylePreset;
}

/**
 * Create an image generation model that calls the Stability AI image generation API.
 *
 * @see https://api.stability.ai/docs#tag/v1generation/operation/textToImage
 *
 * @example
 * const image = await generateImage(
 *   stability.ImageGenerator({
 *     model: "stable-diffusion-v1-6",
 *     cfgScale: 7,
 *     clipGuidancePreset: "FAST_BLUE",
 *     height: 512,
 *     width: 512,
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
    callOptions: FunctionCallOptions
  ): Promise<StabilityImageGenerationResponse> {
    const api = this.settings.api ?? new StabilityApiConfiguration();
    const abortSignal = callOptions.run?.abortSignal;

    return callWithRetryAndThrottle({
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl(
            `/generation/${this.settings.model}/text-to-image`
          ),
          headers: api.headers({
            functionType: callOptions.functionType,
            functionId: callOptions.functionId,
            run: callOptions.run,
            callId: callOptions.callId,
          }),
          body: {
            height: this.settings.height,
            width: this.settings.width,
            text_prompts: input,
            cfg_scale: this.settings.cfgScale,
            clip_guidance_preset: this.settings.clipGuidancePreset,
            sampler: this.settings.sampler,
            samples: this.settings.numberOfGenerations,
            seed: this.settings.seed,
            steps: this.settings.steps,
            style_preset: this.settings.stylePreset,
          },
          failedResponseHandler: failedStabilityCallResponseHandler,
          successfulResponseHandler: createJsonResponseHandler(
            zodSchema(stabilityImageGenerationResponseSchema)
          ),
          abortSignal,
        }),
    });
  }

  get settingsForEvent(): Partial<StabilityImageGenerationSettings> {
    return {
      numberOfGenerations: this.settings.numberOfGenerations,
      height: this.settings.height,
      width: this.settings.width,
      cfgScale: this.settings.cfgScale,
      clipGuidancePreset: this.settings.clipGuidancePreset,
      sampler: this.settings.sampler,
      seed: this.settings.seed,
      steps: this.settings.steps,
      stylePreset: this.settings.stylePreset,
    };
  }

  async doGenerateImages(
    prompt: StabilityImageGenerationPrompt,
    callOptions: FunctionCallOptions
  ) {
    const rawResponse = await this.callAPI(prompt, callOptions);

    return {
      rawResponse,
      base64Images: rawResponse.artifacts.map((artifact) => artifact.base64),
    };
  }

  withTextPrompt() {
    return this.withPromptTemplate(mapBasicPromptToStabilityFormat());
  }

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: PromptTemplate<INPUT_PROMPT, StabilityImageGenerationPrompt>
  ): PromptTemplateImageGenerationModel<
    INPUT_PROMPT,
    StabilityImageGenerationPrompt,
    StabilityImageGenerationSettings,
    this
  > {
    return new PromptTemplateImageGenerationModel({
      model: this,
      promptTemplate,
    });
  }

  withSettings(additionalSettings: Partial<StabilityImageGenerationSettings>) {
    return new StabilityImageGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
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
