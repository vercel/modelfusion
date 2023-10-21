import { z } from "zod";
import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postToApi,
} from "../../core/api/postToApi.js";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { PromptFormatTextGenerationModel } from "../../model-function/generate-text/PromptFormatTextGenerationModel.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { TextGenerationPromptFormat } from "../../model-function/generate-text/TextGenerationPromptFormat.js";
import { HuggingFaceApiConfiguration } from "./HuggingFaceApiConfiguration.js";
import { failedHuggingFaceCallResponseHandler } from "./HuggingFaceError.js";

export interface HuggingFaceImageDescriptionModelSettings
  extends TextGenerationModelSettings {
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
    TextGenerationModel<Buffer, HuggingFaceImageDescriptionModelSettings>
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
    options?: FunctionOptions
  ): Promise<HuggingFaceImageDescriptionResponse> {
    return callWithRetryAndThrottle({
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () =>
        callHuggingFaceImageDescriptionAPI({
          ...this.settings,
          abortSignal: options?.run?.abortSignal,
          data,
        }),
    });
  }

  get settingsForEvent(): Partial<HuggingFaceImageDescriptionModelSettings> {
    return {};
  }

  readonly contextWindowSize = undefined;
  readonly tokenizer = undefined;
  readonly countPromptTokens = undefined;

  async doGenerateText(data: Buffer, options?: FunctionOptions) {
    const response = await this.callAPI(data, options);
    return {
      response,
      text: response[0].generated_text,
    };
  }

  withPromptFormat<INPUT_PROMPT>(
    promptFormat: TextGenerationPromptFormat<INPUT_PROMPT, Buffer>
  ): PromptFormatTextGenerationModel<
    INPUT_PROMPT,
    Buffer,
    HuggingFaceImageDescriptionModelSettings,
    this
  > {
    return new PromptFormatTextGenerationModel({
      model: this, // stop tokens are not supported by this model
      promptFormat,
    });
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
