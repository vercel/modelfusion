import z from "zod";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postToApi,
} from "../../core/api/postToApi.js";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { ModelFunctionOptions } from "../../model-function/ModelFunctionOptions.js";
import {
  ImageDescriptionModel,
  ImageDescriptionModelSettings,
} from "../../model-function/describe-image/ImageDescriptionModel.js";
import { HuggingFaceApiConfiguration } from "./HuggingFaceApiConfiguration.js";
import { failedHuggingFaceCallResponseHandler } from "./HuggingFaceError.js";

export interface HuggingFaceImageDescriptionModelSettings
  extends ImageDescriptionModelSettings {
  api?: ApiConfiguration;

  model: string;
}

/**
 * Create an image to text model that calls a Hugging Face Image-to-Text Inference API.
 *
 * @see https://huggingface.co/tasks/image-to-text
 */
export class HuggingFaceImageDescriptionModel
  extends AbstractModel<HuggingFaceImageDescriptionModelSettings>
  implements
    ImageDescriptionModel<
      Buffer,
      HuggingFaceImageDescriptionResponse,
      HuggingFaceImageDescriptionModelSettings
    >
{
  constructor(settings: HuggingFaceImageDescriptionModelSettings) {
    super({ settings });
  }

  readonly provider = "huggingface";
  get modelName() {
    return this.settings.model;
  }

  async callAPI(
    data: Buffer,
    options?: ModelFunctionOptions<HuggingFaceImageDescriptionModelSettings>
  ): Promise<HuggingFaceImageDescriptionResponse> {
    const run = options?.run;
    const settings = options?.settings;

    const callSettings = {
      ...this.settings,
      ...settings,
      abortSignal: run?.abortSignal,
      data,
    };

    return callWithRetryAndThrottle({
      retry: callSettings.api?.retry,
      throttle: callSettings.api?.throttle,
      call: async () => callHuggingFaceImageDescriptionAPI(callSettings),
    });
  }

  get settingsForEvent(): Partial<HuggingFaceImageDescriptionModelSettings> {
    return {};
  }

  readonly countPromptTokens = undefined;

  generateImageDescriptionResponse(
    data: Buffer,
    options?: ModelFunctionOptions<HuggingFaceImageDescriptionModelSettings>
  ) {
    return this.callAPI(data, options);
  }

  extractImageDescription(
    response: HuggingFaceImageDescriptionResponse
  ): string {
    return response[0].generated_text;
  }

  withSettings(
    additionalSettings: Partial<HuggingFaceImageDescriptionModelSettings>
  ) {
    return new HuggingFaceImageDescriptionModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const huggingFaceImageDescriptionResponseSchema = z.array(
  z.object({
    generated_text: z.string(),
  })
);

export type HuggingFaceImageDescriptionResponse = z.infer<
  typeof huggingFaceImageDescriptionResponseSchema
>;

async function callHuggingFaceImageDescriptionAPI({
  api = new HuggingFaceApiConfiguration(),
  abortSignal,
  model,
  data,
}: {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  model: string;
  data: Buffer;
}): Promise<HuggingFaceImageDescriptionResponse> {
  return postToApi({
    url: api.assembleUrl(`/${model}`),
    headers: api.headers,
    body: {
      content: data,
      values: {},
    },
    failedResponseHandler: failedHuggingFaceCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      huggingFaceImageDescriptionResponseSchema
    ),
    abortSignal,
  });
}
