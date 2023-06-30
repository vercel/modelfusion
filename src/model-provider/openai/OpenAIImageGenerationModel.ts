import { z } from "zod";
import { FunctionOptions } from "../../model/FunctionOptions.js";
import { AbstractImageGenerationModel } from "../../model/image-generation/AbstractImageGenerationModel.js";
import { ImageGenerationModelSettings } from "../../model/image-generation/ImageGenerationModel.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  ResponseHandler,
  createJsonResponseHandler,
  postJsonToApi,
} from "../../util/api/postToApi.js";
import { OpenAIModelSettings } from "./OpenAIModelSettings.js";
import { failedOpenAICallResponseHandler } from "./failedOpenAICallResponseHandler.js";

export interface OpenAIImageGenerationCallSettings {
  n?: number;
  size?: "256x256" | "512x512" | "1024x1024";
}

/**
 * @see https://openai.com/pricing
 */
const sizeToCostInMillicents = {
  "1024x1024": 2000,
  "512x512": 1800,
  "256x256": 1600,
};

export const calculateOpenAIImageGenerationCostInMillcent = ({
  settings,
}: {
  settings: OpenAIImageGenerationSettings;
}): number =>
  (settings.n ?? 1) * sizeToCostInMillicents[settings.size ?? "1024x1024"];

export interface OpenAIImageGenerationSettings
  extends ImageGenerationModelSettings,
    OpenAIImageGenerationCallSettings,
    OpenAIModelSettings {
  isUserIdForwardingEnabled?: boolean;
}

/**
 * Create an image generation model that calls the OpenAI AI image creation API.
 *
 * @see https://platform.openai.com/docs/api-reference/images/create
 *
 * @example
 * const model = new OpenAIImageGenerationModel({
 *   size: "512x512",
 * });
 *
 * const image = await model.generateImage(
 *   "the wicked witch of the west in the style of early 19th century painting"
 * );
 */
export class OpenAIImageGenerationModel extends AbstractImageGenerationModel<
  string,
  OpenAIImageGenerationBase64JsonResponse,
  OpenAIImageGenerationSettings
> {
  constructor(settings: OpenAIImageGenerationSettings) {
    super({
      settings,
      extractBase64Image: (response) => response.data[0].b64_json,
      generateResponse: (prompt, options) =>
        this.callAPI(prompt, {
          responseFormat: OpenAIImageGenerationResponseFormat.base64Json,
          functionId: options?.functionId,
          settings: options?.settings,
          run: options?.run,
        }),
    });
  }

  readonly provider = "openai" as const;
  readonly modelName = null;

  private get apiKey() {
    const apiKey = this.settings.apiKey ?? process.env.OPENAI_API_KEY;

    if (apiKey == null) {
      throw new Error(
        `OpenAI API key is missing. Pass it as an argument to the constructor or set it as an environment variable named OPENAI_API_KEY.`
      );
    }

    return apiKey;
  }

  async callAPI<RESULT>(
    prompt: string,
    options: {
      responseFormat: OpenAIImageGenerationResponseFormatType<RESULT>;
    } & FunctionOptions<
      Partial<
        OpenAIImageGenerationCallSettings &
          OpenAIModelSettings & { user?: string }
      >
    >
  ): Promise<RESULT> {
    const run = options?.run;
    const settings = options?.settings;
    const responseFormat = options?.responseFormat;

    const callSettings = Object.assign(
      {
        apiKey: this.apiKey,
        user: this.settings.isUserIdForwardingEnabled ? run?.userId : undefined,
      },
      this.settings,
      settings,
      {
        abortSignal: run?.abortSignal,
        prompt,
        responseFormat,
      }
    );

    return callWithRetryAndThrottle({
      retry: callSettings.retry,
      throttle: callSettings.throttle,
      call: async () => callOpenAIImageGenerationAPI(callSettings),
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
    handler: createJsonResponseHandler(openAIImageGenerationUrlSchema),
  },
  base64Json: {
    type: "b64_json" as const,
    handler: createJsonResponseHandler(openAIImageGenerationBase64JsonSchema),
  },
};

async function callOpenAIImageGenerationAPI<RESPONSE>({
  baseUrl = "https://api.openai.com/v1",
  abortSignal,
  apiKey,
  prompt,
  n,
  size,
  responseFormat,
  user,
}: OpenAIImageGenerationCallSettings & {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
  prompt: string;
  responseFormat: OpenAIImageGenerationResponseFormatType<RESPONSE>;
  user?: string;
}): Promise<RESPONSE> {
  return postJsonToApi({
    url: `${baseUrl}/images/generations`,
    apiKey,
    body: {
      prompt,
      n,
      size,
      response_format: responseFormat.type,
      user,
    },
    failedResponseHandler: failedOpenAICallResponseHandler,
    successfulResponseHandler: responseFormat?.handler,
    abortSignal,
  });
}
