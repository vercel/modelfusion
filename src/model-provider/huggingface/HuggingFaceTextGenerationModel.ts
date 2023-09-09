import z from "zod";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { ModelFunctionOptions } from "../../model-function/ModelFunctionOptions.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { PromptFormat } from "../../prompt/PromptFormat.js";
import { PromptFormatTextGenerationModel } from "../../prompt/PromptFormatTextGenerationModel.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi.js";
import { HuggingFaceApiConfiguration } from "./HuggingFaceApiConfiguration.js";
import { failedHuggingFaceCallResponseHandler } from "./HuggingFaceError.js";

export interface HuggingFaceTextGenerationModelSettings
  extends TextGenerationModelSettings {
  api?: ApiConfiguration;

  model: string;

  topK?: number;
  topP?: number;
  temperature?: number;
  repetitionPenalty?: number;
  maxTime?: number;
  numReturnSequences?: number;
  doSample?: boolean;

  options?: {
    useCache?: boolean;
    waitForModel?: boolean;
  };
}

/**
 * Create a text generation model that calls a Hugging Face Inference API Text Generation Task.
 *
 * @see https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task
 *
 * @example
 * const model = new HuggingFaceTextGenerationModel({
 *   model: "tiiuae/falcon-7b",
 *   temperature: 0.7,
 *   maxCompletionTokens: 500,
 *   retry: retryWithExponentialBackoff({ maxTries: 5 }),
 * });
 *
 * const text = await generateText(
 *   model,
 *   "Write a short story about a robot learning to love:\n\n"
 * );
 */
export class HuggingFaceTextGenerationModel
  extends AbstractModel<HuggingFaceTextGenerationModelSettings>
  implements
    TextGenerationModel<
      string,
      HuggingFaceTextGenerationResponse,
      undefined,
      HuggingFaceTextGenerationModelSettings
    >
{
  constructor(settings: HuggingFaceTextGenerationModelSettings) {
    super({ settings });
  }

  readonly provider = "huggingface";
  get modelName() {
    return this.settings.model;
  }

  readonly contextWindowSize = undefined;
  readonly tokenizer = undefined;

  async callAPI(
    prompt: string,
    options?: ModelFunctionOptions<HuggingFaceTextGenerationModelSettings>
  ): Promise<HuggingFaceTextGenerationResponse> {
    const run = options?.run;
    const settings = options?.settings;

    const combinedSettings = {
      ...this.settings,
      ...settings,
    };

    const callSettings = {
      options: {
        useCache: true,
        waitForModel: true,
      },
      ...combinedSettings,
      maxNewTokens: combinedSettings.maxCompletionTokens,
      abortSignal: run?.abortSignal,
      inputs: prompt,
    };

    return callWithRetryAndThrottle({
      retry: callSettings.api?.retry,
      throttle: callSettings.api?.throttle,
      call: async () => callHuggingFaceTextGenerationAPI(callSettings),
    });
  }

  get settingsForEvent(): Partial<HuggingFaceTextGenerationModelSettings> {
    const eventSettingProperties: Array<string> = [
      "stopSequences",
      "maxCompletionTokens",

      "topK",
      "topP",
      "temperature",
      "repetitionPenalty",
      "maxTime",
      "numReturnSequences",
      "doSample",
      "options",
    ] satisfies (keyof HuggingFaceTextGenerationModelSettings)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  readonly countPromptTokens = undefined;

  generateTextResponse(
    prompt: string,
    options?: ModelFunctionOptions<HuggingFaceTextGenerationModelSettings>
  ) {
    return this.callAPI(prompt, options);
  }

  extractText(response: HuggingFaceTextGenerationResponse): string {
    return response[0].generated_text;
  }

  generateDeltaStreamResponse = undefined;
  extractTextDelta = undefined;

  withPromptFormat<INPUT_PROMPT>(
    promptFormat: PromptFormat<INPUT_PROMPT, string>
  ): PromptFormatTextGenerationModel<
    INPUT_PROMPT,
    string,
    HuggingFaceTextGenerationResponse,
    undefined,
    HuggingFaceTextGenerationModelSettings,
    this
  > {
    return new PromptFormatTextGenerationModel({
      model: this, // stop tokens are not supported by this model
      promptFormat,
    });
  }

  withSettings(
    additionalSettings: Partial<HuggingFaceTextGenerationModelSettings>
  ) {
    return new HuggingFaceTextGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const huggingFaceTextGenerationResponseSchema = z.array(
  z.object({
    generated_text: z.string(),
  })
);

export type HuggingFaceTextGenerationResponse = z.infer<
  typeof huggingFaceTextGenerationResponseSchema
>;

async function callHuggingFaceTextGenerationAPI({
  api = new HuggingFaceApiConfiguration(),
  abortSignal,
  model,
  inputs,
  topK,
  topP,
  temperature,
  repetitionPenalty,
  maxNewTokens,
  maxTime,
  numReturnSequences,
  doSample,
  options,
}: {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  model: string;
  inputs: string;
  topK?: number;
  topP?: number;
  temperature?: number;
  repetitionPenalty?: number;
  maxNewTokens?: number;
  maxTime?: number;
  numReturnSequences?: number;
  doSample?: boolean;
  options?: {
    useCache?: boolean;
    waitForModel?: boolean;
  };
}): Promise<HuggingFaceTextGenerationResponse> {
  return postJsonToApi({
    url: api.assembleUrl(`/${model}`),
    headers: api.headers,
    body: {
      inputs,
      top_k: topK,
      top_p: topP,
      temperature,
      repetition_penalty: repetitionPenalty,
      max_new_tokens: maxNewTokens,
      max_time: maxTime,
      num_return_sequences: numReturnSequences,
      do_sample: doSample,
      options: options
        ? {
            use_cache: options?.useCache,
            wait_for_model: options?.waitForModel,
          }
        : undefined,
    },
    failedResponseHandler: failedHuggingFaceCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      huggingFaceTextGenerationResponseSchema
    ),
    abortSignal,
  });
}
