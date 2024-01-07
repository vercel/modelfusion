import { z } from "zod";
import { FunctionCallOptions } from "../../core/FunctionOptions.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  ResponseHandler,
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
import { OpenAIApiConfiguration } from "./OpenAIApiConfiguration.js";
import { failedOpenAICallResponseHandler } from "./OpenAIError.js";

export const OPENAI_IMAGE_MODELS = {
  "dall-e-2": {
    getCost(settings: OpenAIImageGenerationSettings) {
      switch (settings.size ?? "1024x1024") {
        case "1024x1024":
          return 2000;
        case "512x512":
          return 1800;
        case "256x256":
          return 1600;
        default:
          return null;
      }
    },
  },
  "dall-e-3": {
    getCost(settings: OpenAIImageGenerationSettings) {
      switch (settings.quality ?? "standard") {
        case "standard": {
          switch (settings.size ?? "1024x1024") {
            case "1024x1024":
              return 4000;
            case "1024x1792":
            case "1792x1024":
              return 8000;
            default:
              return null;
          }
        }
        case "hd": {
          switch (settings.size ?? "1024x1024") {
            case "1024x1024":
              return 8000;
            case "1024x1792":
            case "1792x1024":
              return 12000;
            default:
              return null;
          }
        }
      }
    },
  },
};

/**
 * @see https://openai.com/pricing
 */
export const calculateOpenAIImageGenerationCostInMillicents = ({
  model,
  settings,
}: {
  model: OpenAIImageModelType;
  settings: OpenAIImageGenerationSettings;
}): number | null => {
  const cost = OPENAI_IMAGE_MODELS[model]?.getCost(settings);

  if (cost == null) {
    return null;
  }

  return (settings.numberOfGenerations ?? 1) * cost;
};

export type OpenAIImageModelType = keyof typeof OPENAI_IMAGE_MODELS;

export interface OpenAIImageGenerationCallSettings {
  model: OpenAIImageModelType;
  size?: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
}

export interface OpenAIImageGenerationSettings
  extends ImageGenerationModelSettings,
    OpenAIImageGenerationCallSettings {
  api?: ApiConfiguration;
  isUserIdForwardingEnabled?: boolean;
}

/**
 * Create an image generation model that calls the OpenAI AI image creation API.
 *
 * @see https://platform.openai.com/docs/api-reference/images/create
 *
 * @example
 * const image = await generateImage(
 *   new OpenAIImageGenerationModel({ size: "512x512" }),
 *   "the wicked witch of the west in the style of early 19th century painting"
 * );
 */
export class OpenAIImageGenerationModel
  extends AbstractModel<OpenAIImageGenerationSettings>
  implements ImageGenerationModel<string, OpenAIImageGenerationSettings>
{
  constructor(settings: OpenAIImageGenerationSettings) {
    super({ settings });
  }

  readonly provider = "openai" as const;
  get modelName() {
    return this.settings.model;
  }

  async callAPI<RESULT>(
    prompt: string,
    callOptions: FunctionCallOptions,
    options: {
      responseFormat: OpenAIImageGenerationResponseFormatType<RESULT>;
    }
  ): Promise<RESULT> {
    const api = this.settings.api ?? new OpenAIApiConfiguration();
    const abortSignal = callOptions.run?.abortSignal;
    const userId = callOptions.run?.userId;
    const responseFormat = options.responseFormat;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl("/images/generations"),
          headers: api.headers({
            functionType: callOptions.functionType,
            functionId: callOptions.functionId,
            run: callOptions.run,
            callId: callOptions.callId,
          }),
          body: {
            prompt,
            n: this.settings.numberOfGenerations,
            size: this.settings.size,
            response_format: responseFormat.type,
            user: this.settings.isUserIdForwardingEnabled ? userId : undefined,
          },
          failedResponseHandler: failedOpenAICallResponseHandler,
          successfulResponseHandler: responseFormat.handler,
          abortSignal,
        }),
    });
  }

  get settingsForEvent(): Partial<OpenAIImageGenerationSettings> {
    const eventSettingProperties: Array<string> = [
      "numberOfGenerations",
      "size",
      "quality",
      "style",
    ] satisfies (keyof OpenAIImageGenerationSettings)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  async doGenerateImages(prompt: string, options: FunctionCallOptions) {
    const rawResponse = await this.callAPI(prompt, options, {
      responseFormat: OpenAIImageGenerationResponseFormat.base64Json,
    });

    return {
      rawResponse,
      base64Images: rawResponse.data.map((item) => item.b64_json),
    };
  }
  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: PromptTemplate<INPUT_PROMPT, string>
  ): PromptTemplateImageGenerationModel<
    INPUT_PROMPT,
    string,
    OpenAIImageGenerationSettings,
    this
  > {
    return new PromptTemplateImageGenerationModel({
      model: this,
      promptTemplate,
    });
  }

  withSettings(additionalSettings: Partial<OpenAIImageGenerationSettings>) {
    return new OpenAIImageGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

export type OpenAIImageGenerationResponseFormatType<T> = {
  type: "b64_json" | "url";
  handler: ResponseHandler<T>;
};

const openAIImageGenerationUrlSchema = z.object({
  created: z.number(),
  data: z.array(
    z.object({
      url: z.string(),
    })
  ),
});

export type OpenAIImageGenerationUrlResponse = z.infer<
  typeof openAIImageGenerationUrlSchema
>;

const openAIImageGenerationBase64JsonSchema = z.object({
  created: z.number(),
  data: z.array(
    z.object({
      b64_json: z.string(),
    })
  ),
});

export type OpenAIImageGenerationBase64JsonResponse = z.infer<
  typeof openAIImageGenerationBase64JsonSchema
>;

export const OpenAIImageGenerationResponseFormat = {
  url: {
    type: "url" as const,
    handler: createJsonResponseHandler(
      zodSchema(openAIImageGenerationUrlSchema)
    ),
  },
  base64Json: {
    type: "b64_json" as const,
    handler: createJsonResponseHandler(
      zodSchema(openAIImageGenerationBase64JsonSchema)
    ),
  },
};
