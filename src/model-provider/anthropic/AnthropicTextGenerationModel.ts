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
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { PromptFormat } from "../../prompt/PromptFormat.js";
import { PromptFormatTextGenerationModel } from "../../prompt/PromptFormatTextGenerationModel.js";
import { AnthropicApiConfiguration } from "./AnthropicApiConfiguration.js";
import { failedAnthropicCallResponseHandler } from "./AnthropicError.js";

export const ANTHROPIC_TEXT_GENERATION_MODELS = {
  "claude-instant-1": {
    contextWindowSize: 100_000,
  },
  "claude-instant-1.2": {
    contextWindowSize: 100_000,
  },
  "claude-2": {
    contextWindowSize: 100_000,
  },
  "claude-2.0": {
    contextWindowSize: 100_000,
  },
};

export type AnthropicTextGenerationModelType =
  keyof typeof ANTHROPIC_TEXT_GENERATION_MODELS;

export interface AnthropicTextGenerationModelSettings
  extends TextGenerationModelSettings {
  api?: ApiConfiguration;

  model: AnthropicTextGenerationModelType;

  temperature?: number;
  topP?: number;
  topK?: number;
  userId?: number;
}

/**
 * Create a text generation model that calls the Anthropic API.
 *
 * @see https://docs.anthropic.com/claude/reference/complete_post
 */
export class AnthropicTextGenerationModel
  extends AbstractModel<AnthropicTextGenerationModelSettings>
  implements TextGenerationModel<string, AnthropicTextGenerationModelSettings>
{
  constructor(settings: AnthropicTextGenerationModelSettings) {
    super({ settings });

    this.contextWindowSize =
      ANTHROPIC_TEXT_GENERATION_MODELS[this.settings.model].contextWindowSize;
  }

  readonly provider = "anthropic" as const;
  get modelName() {
    return this.settings.model;
  }

  readonly contextWindowSize: number;

  readonly tokenizer = undefined;
  readonly countPromptTokens = undefined;

  async callAPI<RESPONSE>(
    prompt: string,
    options: {
      responseFormat: AnthropicTextGenerationResponseFormatType<RESPONSE>;
    } & FunctionOptions
  ): Promise<RESPONSE> {
    return callWithRetryAndThrottle({
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () =>
        callAnthropicTextGenerationAPI({
          ...this.settings,

          stopSequences: this.settings.stopSequences,
          maxTokens: this.settings.maxCompletionTokens,

          abortSignal: options.run?.abortSignal,
          responseFormat: options.responseFormat,
          prompt,
        }),
    });
  }

  get settingsForEvent(): Partial<AnthropicTextGenerationModelSettings> {
    const eventSettingProperties: Array<string> = [
      "maxCompletionTokens",
      "stopSequences",

      "temperature",
      "topK",
      "topP",
      "userId",
    ] satisfies (keyof AnthropicTextGenerationModelSettings)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  async doGenerateText(prompt: string, options?: FunctionOptions) {
    const response = await this.callAPI(prompt, {
      ...options,
      responseFormat: AnthropicTextGenerationResponseFormat.json,
    });

    return {
      response,
      text: response.completion,
    };
  }

  withPromptFormat<INPUT_PROMPT>(
    promptFormat: PromptFormat<INPUT_PROMPT, string>
  ): PromptFormatTextGenerationModel<
    INPUT_PROMPT,
    string,
    AnthropicTextGenerationModelSettings,
    this
  > {
    return new PromptFormatTextGenerationModel({
      model: this.withSettings({
        stopSequences: [
          ...(this.settings.stopSequences ?? []),
          ...promptFormat.stopSequences,
        ],
      }),
      promptFormat,
    });
  }

  withSettings(
    additionalSettings: Partial<AnthropicTextGenerationModelSettings>
  ) {
    return new AnthropicTextGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const anthropicTextGenerationResponseSchema = z.object({
  completion: z.string(),
  stop_reason: z.string(),
  model: z.string(),
});

export type AnthropicTextGenerationResponse = z.infer<
  typeof anthropicTextGenerationResponseSchema
>;

async function callAnthropicTextGenerationAPI<RESPONSE>({
  api = new AnthropicApiConfiguration(),
  abortSignal,
  responseFormat,
  model,
  prompt,
  maxTokens,
  stopSequences,
  temperature,
  topK,
  topP,
  userId,
}: {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  responseFormat: AnthropicTextGenerationResponseFormatType<RESPONSE>;
  model: AnthropicTextGenerationModelType;
  prompt: string;
  maxTokens?: number;
  stopSequences?: string[];
  temperature?: number;
  topP?: number;
  topK?: number;
  userId?: number;
}): Promise<RESPONSE> {
  return postJsonToApi({
    url: api.assembleUrl(`/complete`),
    headers: api.headers,
    body: {
      model,
      prompt,
      max_tokens_to_sample: maxTokens,
      temperature,
      top_k: topK,
      top_p: topP,
      stop_sequences: stopSequences,
      metadata: userId != null ? { user_id: userId } : undefined,
    },
    failedResponseHandler: failedAnthropicCallResponseHandler,
    successfulResponseHandler: responseFormat.handler,
    abortSignal,
  });
}

export type AnthropicTextGenerationResponseFormatType<T> = {
  stream: boolean;
  handler: ResponseHandler<T>;
};

export const AnthropicTextGenerationResponseFormat = {
  /**
   * Returns the response as a JSON object.
   */
  json: {
    stream: false,
    handler: createJsonResponseHandler(anthropicTextGenerationResponseSchema),
  } satisfies AnthropicTextGenerationResponseFormatType<AnthropicTextGenerationResponse>,
};
