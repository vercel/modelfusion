import { z } from "zod";
import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  ResponseHandler,
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
import { OpenAIApiConfiguration } from "./OpenAIApiConfiguration.js";
import { failedOpenAICallResponseHandler } from "./OpenAIError.js";

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

export const calculateOpenAIImageGenerationCostInMillicents = ({
  settings,
}: {
  settings: OpenAIImageGenerationSettings;
}): number =>
  (settings.n ?? 1) * sizeToCostInMillicents[settings.size ?? "1024x1024"];

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
  readonly modelName = null;

  async callAPI<RESULT>(
    prompt: string,
    options: {
      responseFormat: OpenAIImageGenerationResponseFormatType<RESULT>;
    } & FunctionOptions
  ): Promise<RESULT> {
    const run = options?.run;
    const responseFormat = options?.responseFormat;

    const callSettings = {
      ...this.settings,
      user: this.settings.isUserIdForwardingEnabled ? run?.userId : undefined,
      abortSignal: run?.abortSignal,
      responseFormat,
      prompt,
    };

    return callWithRetryAndThrottle({
      retry: callSettings.api?.retry,
      throttle: callSettings.api?.throttle,
      call: async () => callOpenAIImageGenerationAPI(callSettings),
    });
  }

  get settingsForEvent(): Partial<OpenAIImageGenerationSettings> {
    const eventSettingProperties: Array<string> = [
      "n",
      "size",
    ] satisfies (keyof OpenAIImageGenerationSettings)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  async doGenerateImage(prompt: string, options?: FunctionOptions) {
    const response = await this.callAPI(prompt, {
      responseFormat: OpenAIImageGenerationResponseFormat.base64Json,
      ...options,
    });

    return {
      response,
      base64Image: response.data[0].b64_json,
    };
  }
  withPromptFormat<INPUT_PROMPT>(
    promptFormat: PromptFormat<INPUT_PROMPT, string>
  ): PromptFormatImageGenerationModel<
    INPUT_PROMPT,
    string,
    OpenAIImageGenerationSettings,
    this
  > {
    return new PromptFormatImageGenerationModel({
      model: this,
      promptFormat,
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
  api = new OpenAIApiConfiguration(),
  abortSignal,
  prompt,
  n,
  size,
  responseFormat,
  user,
}: OpenAIImageGenerationCallSettings & {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  prompt: string;
  responseFormat: OpenAIImageGenerationResponseFormatType<RESPONSE>;
  user?: string;
}): Promise<RESPONSE> {
  return postJsonToApi({
    url: api.assembleUrl("/images/generations"),
    headers: api.headers,
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
