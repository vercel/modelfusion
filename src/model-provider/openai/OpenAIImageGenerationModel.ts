import { z } from "zod";
import { AbstractImageGenerationModel } from "../../model/image-generation/AbstractImageGenerationModel.js";
import { ImageGenerationModelSettings } from "../../model/image-generation/ImageGenerationModel.js";
import { RunContext } from "../../run/RunContext.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  ResponseHandler,
  createJsonResponseHandler,
  postJsonToApi,
} from "../../util/api/postToApi.js";
import { failedOpenAICallResponseHandler } from "./failedOpenAICallResponseHandler.js";

export interface OpenAIImageGenerationModelSettings
  extends ImageGenerationModelSettings {
  baseUrl?: string;
  apiKey?: string;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;

  n?: number;
  size?: "256x256" | "512x512" | "1024x1024";
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
  OpenAIImageGenerationModelSettings
> {
  constructor(settings: OpenAIImageGenerationModelSettings) {
    super({
      settings,
      extractBase64Image: (response) => response.data[0].b64_json,
      generateResponse: (prompt, context) =>
        this.callAPI(
          prompt,
          {
            responseFormat: OpenAIImageGenerationResponseFormat.base64Json,
          },
          context
        ),
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
    input: string,
    settings: {
      baseUrl?: string;
      apiKey?: string;

      retry?: RetryFunction;
      throttle?: ThrottleFunction;

      responseFormat: OpenAIImageGenerationResponseFormatType<RESULT>;

      n?: number;
      size?: "256x256" | "512x512" | "1024x1024";

      user?: string;
    },
    context?: RunContext
  ): Promise<RESULT> {
    const callSettings = Object.assign(
      {
        apiKey: this.apiKey,
      },
      this.settings,
      settings
    );

    return callWithRetryAndThrottle({
      retry: callSettings.retry,
      throttle: callSettings.throttle,
      call: async () =>
        callOpenAIImageGenerationAPI({
          abortSignal: context?.abortSignal,
          prompt: input,
          ...callSettings,
        }),
    });
  }
  withSettings(
    additionalSettings: Partial<OpenAIImageGenerationModelSettings>
  ) {
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

/**
 * Call the OpenAI Image Creation API to generate an image for the given prompt.
 *
 * @see https://platform.openai.com/docs/api-reference/images/create
 *
 * @example
 * const imageResponse = await callOpenAIImageGenerationAPI({
 *   apiKey: OPENAI_API_KEY,
 *   prompt:
 *     "the wicked witch of the west in the style of early 19th century painting",
 *   size: "512x512",
 *   responseFormat: callOpenAIImageGenerationAPI.responseFormat.base64Json,
 * });
 */
async function callOpenAIImageGenerationAPI<RESPONSE>({
  baseUrl = "https://api.openai.com/v1",
  abortSignal,
  apiKey,
  prompt,
  n,
  size,
  responseFormat,
  user,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
  prompt: string;
  n?: number;
  size?: "256x256" | "512x512" | "1024x1024";
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
