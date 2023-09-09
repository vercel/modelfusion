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
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { PromptFormat } from "../../prompt/PromptFormat.js";
import { PromptFormatTextGenerationModel } from "../../prompt/PromptFormatTextGenerationModel.js";
import { HuggingFaceApiConfiguration } from "./HuggingFaceApiConfiguration.js";
import { failedHuggingFaceCallResponseHandler } from "./HuggingFaceError.js";

export interface HuggingFaceImageToTextModelSettings
  extends TextGenerationModelSettings {
  api?: ApiConfiguration;

  model: string;
}

/**
 * Create an image to text model that calls a Hugging Face Image-to-Text Inference API.
 *
 * @see https://huggingface.co/tasks/image-to-text
 */
export class HuggingFaceImageToTextModel
  extends AbstractModel<HuggingFaceImageToTextModelSettings>
  implements
    TextGenerationModel<
      Buffer,
      HuggingFaceImageToTextResponse,
      undefined,
      HuggingFaceImageToTextModelSettings
    >
{
  constructor(settings: HuggingFaceImageToTextModelSettings) {
    super({ settings });
  }

  readonly provider = "huggingface";
  get modelName() {
    return this.settings.model;
  }

  readonly contextWindowSize = undefined;
  readonly tokenizer = undefined;

  async callAPI(
    data: Buffer,
    options?: ModelFunctionOptions<HuggingFaceImageToTextModelSettings>
  ): Promise<HuggingFaceImageToTextResponse> {
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
      call: async () => callHuggingFaceImageToTextAPI(callSettings),
    });
  }

  get settingsForEvent(): Partial<HuggingFaceImageToTextModelSettings> {
    return {};
  }

  readonly countPromptTokens = undefined;

  generateTextResponse(
    data: Buffer,
    options?: ModelFunctionOptions<HuggingFaceImageToTextModelSettings>
  ) {
    return this.callAPI(data, options);
  }

  extractText(response: HuggingFaceImageToTextResponse): string {
    return response[0].generated_text;
  }

  generateDeltaStreamResponse = undefined;
  extractTextDelta = undefined;

  withPromptFormat<INPUT_PROMPT>(
    promptFormat: PromptFormat<INPUT_PROMPT, Buffer>
  ): PromptFormatTextGenerationModel<
    INPUT_PROMPT,
    Buffer,
    HuggingFaceImageToTextResponse,
    undefined,
    HuggingFaceImageToTextModelSettings,
    this
  > {
    return new PromptFormatTextGenerationModel({
      model: this,
      promptFormat,
    });
  }

  withSettings(
    additionalSettings: Partial<HuggingFaceImageToTextModelSettings>
  ) {
    return new HuggingFaceImageToTextModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const huggingFaceImageToTextResponseSchema = z.array(
  z.object({
    generated_text: z.string(),
  })
);

export type HuggingFaceImageToTextResponse = z.infer<
  typeof huggingFaceImageToTextResponseSchema
>;

async function callHuggingFaceImageToTextAPI({
  api = new HuggingFaceApiConfiguration(),
  abortSignal,
  model,
  data,
}: {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  model: string;
  data: Buffer;
}): Promise<HuggingFaceImageToTextResponse> {
  return postToApi({
    url: api.assembleUrl(`/${model}`),
    headers: api.headers,
    body: {
      content: data,
      values: {},
    },
    failedResponseHandler: failedHuggingFaceCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      huggingFaceImageToTextResponseSchema
    ),
    abortSignal,
  });
}
