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
import { Automatic1111ApiConfiguration } from "./Automatic1111ApiConfiguration.js";
import { failedAutomatic1111CallResponseHandler } from "./Automatic1111Error.js";
import {
  Automatic1111ImageGenerationPrompt,
  mapBasicPromptToAutomatic1111Format,
} from "./Automatic1111ImageGenerationPrompt.js";

export interface Automatic1111ImageGenerationSettings
  extends ImageGenerationModelSettings {
  api?: ApiConfiguration;

  /**
   * Stable Diffusion checkpoint.
   */
  model: string;

  height?: number;
  width?: number;

  /**
   * Sampling method.
   */
  sampler?: string;

  /**
   * Sampling steps.
   */
  steps?: number;

  /**
   * CFG Scale.
   */
  cfgScale?: number;

  seed?: number;
}

/**
 * Create an image generation model that calls the AUTOMATIC1111 Stable Diffusion Web UI API.
 *
 * @see https://github.com/AUTOMATIC1111/stable-diffusion-webui
 */
export class Automatic1111ImageGenerationModel
  extends AbstractModel<Automatic1111ImageGenerationSettings>
  implements
    ImageGenerationModel<
      Automatic1111ImageGenerationPrompt,
      Automatic1111ImageGenerationSettings
    >
{
  constructor(settings: Automatic1111ImageGenerationSettings) {
    super({ settings });
  }

  readonly provider = "Automatic1111" as const;

  get modelName() {
    return this.settings.model;
  }

  async callAPI(
    input: Automatic1111ImageGenerationPrompt,
    callOptions: FunctionCallOptions
  ): Promise<Automatic1111ImageGenerationResponse> {
    const api = this.settings.api ?? new Automatic1111ApiConfiguration();
    const abortSignal = callOptions.run?.abortSignal;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl(`/txt2img`),
          headers: api.headers({
            functionType: callOptions.functionType,
            functionId: callOptions.functionId,
            run: callOptions.run,
            callId: callOptions.callId,
          }),
          body: {
            prompt: input.prompt,
            negative_prompt: input.negativePrompt,
            seed: this.settings.seed,
            batch_size: this.settings.numberOfGenerations,
            height: this.settings.height,
            width: this.settings.width,
            cfg_scale: this.settings.cfgScale,
            sampler_index: this.settings.sampler,
            steps: this.settings.steps,
            override_settings: {
              sd_model_checkpoint: this.settings.model,
            },
          },
          failedResponseHandler: failedAutomatic1111CallResponseHandler,
          successfulResponseHandler: createJsonResponseHandler(
            zodSchema(Automatic1111ImageGenerationResponseSchema)
          ),
          abortSignal,
        }),
    });
  }

  get settingsForEvent(): Partial<Automatic1111ImageGenerationSettings> {
    const eventSettingProperties: Array<string> = [
      "height",
      "width",
      "sampler",
      "steps",
      "cfgScale",
      "seed",
    ] satisfies (keyof Automatic1111ImageGenerationSettings)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  async doGenerateImages(
    prompt: Automatic1111ImageGenerationPrompt,
    options: FunctionCallOptions
  ) {
    const rawResponse = await this.callAPI(prompt, options);

    return {
      rawResponse,
      base64Images: rawResponse.images,
    };
  }

  withTextPrompt() {
    return this.withPromptTemplate(mapBasicPromptToAutomatic1111Format());
  }

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: PromptTemplate<
      INPUT_PROMPT,
      Automatic1111ImageGenerationPrompt
    >
  ): PromptTemplateImageGenerationModel<
    INPUT_PROMPT,
    Automatic1111ImageGenerationPrompt,
    Automatic1111ImageGenerationSettings,
    this
  > {
    return new PromptTemplateImageGenerationModel({
      model: this,
      promptTemplate,
    });
  }

  withSettings(
    additionalSettings: Partial<Automatic1111ImageGenerationSettings>
  ) {
    return new Automatic1111ImageGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const Automatic1111ImageGenerationResponseSchema = z.object({
  images: z.array(z.string()),
  parameters: z.object({}),
  info: z.string(),
});

export type Automatic1111ImageGenerationResponse = z.infer<
  typeof Automatic1111ImageGenerationResponseSchema
>;
