import { z } from "zod";
import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  ResponseHandler,
  createJsonResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi.js";
import { zodSchema } from "../../core/schema/ZodSchema.js";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { PromptTemplateTextStreamingModel } from "../../model-function/generate-text/PromptTemplateTextStreamingModel.js";
import {
  TextGenerationModelSettings,
  TextStreamingModel,
  textGenerationModelProperties,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { TextGenerationPromptTemplate } from "../../model-function/generate-text/TextGenerationPromptTemplate.js";
import { TextGenerationFinishReason } from "../../model-function/generate-text/TextGenerationResult.js";
import {
  chat,
  instruction,
} from "../../model-function/generate-text/prompt-template/TextPromptTemplate.js";
import { countTokens } from "../../model-function/tokenize-text/countTokens.js";
import { createEventSourceResponseHandler } from "../../util/streaming/createEventSourceResponseHandler.js";
import { OpenAIApiConfiguration } from "./OpenAIApiConfiguration.js";
import { failedOpenAICallResponseHandler } from "./OpenAIError.js";
import { TikTokenTokenizer } from "./TikTokenTokenizer.js";

/**
 * @see https://platform.openai.com/docs/models/
 * @see https://openai.com/pricing
 */
export const OPENAI_TEXT_GENERATION_MODELS = {
  "gpt-3.5-turbo-instruct": {
    contextWindowSize: 4097,
    promptTokenCostInMillicents: 0.15,
    completionTokenCostInMillicents: 0.2,
  },
  "davinci-002": {
    contextWindowSize: 16_384,
    promptTokenCostInMillicents: 0.2,
    completionTokenCostInMillicents: 0.2,
    fineTunedTokenCostInMillicents: 1.2,
  },
  "babbage-002": {
    contextWindowSize: 16_384,
    promptTokenCostInMillicents: 0.04,
    completionTokenCostInMillicents: 0.04,
    fineTunedTokenCostInMillicents: 0.16,
  },
  "text-davinci-003": {
    contextWindowSize: 4096,
    promptTokenCostInMillicents: 2,
    completionTokenCostInMillicents: 2,
  },
  "text-davinci-002": {
    contextWindowSize: 4096,
    promptTokenCostInMillicents: 2,
    completionTokenCostInMillicents: 2,
  },
  "code-davinci-002": {
    contextWindowSize: 8000,
    promptTokenCostInMillicents: 2,
    completionTokenCostInMillicents: 2,
  },
  davinci: {
    contextWindowSize: 2048,
    promptTokenCostInMillicents: 2,
    completionTokenCostInMillicents: 2,
  },
  "text-curie-001": {
    contextWindowSize: 2048,
    promptTokenCostInMillicents: 0.2,
    completionTokenCostInMillicents: 0.2,
  },
  curie: {
    contextWindowSize: 2048,
    promptTokenCostInMillicents: 0.2,
    completionTokenCostInMillicents: 0.2,
  },
  "text-babbage-001": {
    contextWindowSize: 2048,
    promptTokenCostInMillicents: 0.05,
    completionTokenCostInMillicents: 0.05,
  },
  babbage: {
    contextWindowSize: 2048,
    promptTokenCostInMillicents: 0.05,
    completionTokenCostInMillicents: 0.05,
  },
  "text-ada-001": {
    contextWindowSize: 2048,
    promptTokenCostInMillicents: 0.04,
    completionTokenCostInMillicents: 0.04,
  },
  ada: {
    contextWindowSize: 2048,
    promptTokenCostInMillicents: 0.04,
    completionTokenCostInMillicents: 0.04,
  },
};

export function getOpenAICompletionModelInformation(
  model: OpenAICompletionModelType
): {
  baseModel: OpenAICompletionBaseModelType;
  isFineTuned: boolean;
  contextWindowSize: number;
  promptTokenCostInMillicents: number;
  completionTokenCostInMillicents: number;
} {
  // Model is already a base model:
  if (model in OPENAI_TEXT_GENERATION_MODELS) {
    const baseModelInformation =
      OPENAI_TEXT_GENERATION_MODELS[model as OpenAICompletionBaseModelType];

    return {
      baseModel: model as OpenAICompletionBaseModelType,
      isFineTuned: false,
      contextWindowSize: baseModelInformation.contextWindowSize,
      promptTokenCostInMillicents:
        baseModelInformation.promptTokenCostInMillicents,
      completionTokenCostInMillicents:
        baseModelInformation.completionTokenCostInMillicents,
    };
  }

  // Extract the base model from the fine-tuned model:
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, baseModel, ___, ____, _____] = model.split(":");

  if (["davinci-002", "babbage-002"].includes(baseModel)) {
    const baseModelInformation =
      OPENAI_TEXT_GENERATION_MODELS[
        baseModel as FineTuneableOpenAICompletionModelType
      ];

    return {
      baseModel: baseModel as FineTuneableOpenAICompletionModelType,
      isFineTuned: true,
      contextWindowSize: baseModelInformation.contextWindowSize,
      promptTokenCostInMillicents:
        baseModelInformation.fineTunedTokenCostInMillicents,
      completionTokenCostInMillicents:
        baseModelInformation.fineTunedTokenCostInMillicents,
    };
  }

  throw new Error(`Unknown OpenAI chat base model ${baseModel}.`);
}

type FineTuneableOpenAICompletionModelType = "davinci-002" | "babbage-002";

type FineTunedOpenAICompletionModelType =
  `ft:${FineTuneableOpenAICompletionModelType}:${string}:${string}:${string}`;

export type OpenAICompletionBaseModelType =
  keyof typeof OPENAI_TEXT_GENERATION_MODELS;

export type OpenAICompletionModelType =
  | OpenAICompletionBaseModelType
  | FineTunedOpenAICompletionModelType;

export const isOpenAICompletionModel = (
  model: string
): model is OpenAICompletionModelType =>
  model in OPENAI_TEXT_GENERATION_MODELS ||
  model.startsWith("ft:davinci-002:") ||
  model.startsWith("ft:babbage-002:");

export const calculateOpenAICompletionCostInMillicents = ({
  model,
  response,
}: {
  model: OpenAICompletionModelType;
  response: OpenAICompletionResponse;
}) => {
  const modelInformation = getOpenAICompletionModelInformation(model);

  return (
    response.usage.prompt_tokens *
      modelInformation.promptTokenCostInMillicents +
    response.usage.completion_tokens *
      modelInformation.completionTokenCostInMillicents
  );
};

export interface OpenAICompletionCallSettings {
  api?: ApiConfiguration;

  model: OpenAICompletionModelType;

  suffix?: string;
  temperature?: number;
  topP?: number;
  logprobs?: number;
  echo?: boolean;
  presencePenalty?: number;
  frequencyPenalty?: number;
  bestOf?: number;
  logitBias?: Record<number, number>;
  seed?: number | null;
}

export interface OpenAICompletionModelSettings
  extends TextGenerationModelSettings,
    Omit<OpenAICompletionCallSettings, "stop" | "maxTokens"> {
  isUserIdForwardingEnabled?: boolean;
}

/**
 * Create a text generation model that calls the OpenAI text completion API.
 *
 * @see https://platform.openai.com/docs/api-reference/completions/create
 *
 * @example
 * const model = new OpenAICompletionModel({
 *   model: "gpt-3.5-turbo-instruct",
 *   temperature: 0.7,
 *   maxGenerationTokens: 500,
 *   retry: retryWithExponentialBackoff({ maxTries: 5 }),
 * });
 *
 * const text = await generateText(
 *   model,
 *   "Write a short story about a robot learning to love:\n\n"
 * );
 */
export class OpenAICompletionModel
  extends AbstractModel<OpenAICompletionModelSettings>
  implements TextStreamingModel<string, OpenAICompletionModelSettings>
{
  constructor(settings: OpenAICompletionModelSettings) {
    super({ settings });

    const modelInformation = getOpenAICompletionModelInformation(
      this.settings.model
    );

    this.tokenizer = new TikTokenTokenizer({
      model: modelInformation.baseModel,
    });
    this.contextWindowSize = modelInformation.contextWindowSize;
  }

  readonly provider = "openai" as const;
  get modelName() {
    return this.settings.model;
  }

  readonly contextWindowSize: number;
  readonly tokenizer: TikTokenTokenizer;

  async countPromptTokens(input: string) {
    return countTokens(this.tokenizer, input);
  }

  async callAPI<RESULT>(
    prompt: string,
    options: {
      responseFormat: OpenAITextResponseFormatType<RESULT>;
    } & FunctionOptions
  ): Promise<RESULT> {
    const api = this.settings.api ?? new OpenAIApiConfiguration();
    const user = this.settings.isUserIdForwardingEnabled
      ? options.run?.userId
      : undefined;
    const abortSignal = options.run?.abortSignal;
    const openaiResponseFormat = options.responseFormat;

    // empty arrays are not allowed for stop:
    const stopSequences =
      this.settings.stopSequences != null &&
      Array.isArray(this.settings.stopSequences) &&
      this.settings.stopSequences.length === 0
        ? undefined
        : this.settings.stopSequences;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () => {
        return postJsonToApi({
          url: api.assembleUrl("/completions"),
          headers: api.headers,
          body: {
            stream: openaiResponseFormat.stream,
            model: this.settings.model,
            prompt,
            suffix: this.settings.suffix,
            max_tokens: this.settings.maxGenerationTokens,
            temperature: this.settings.temperature,
            top_p: this.settings.topP,
            n: this.settings.numberOfGenerations,
            logprobs: this.settings.logprobs,
            echo: this.settings.echo,
            stop: stopSequences,
            seed: this.settings.seed,
            presence_penalty: this.settings.presencePenalty,
            frequency_penalty: this.settings.frequencyPenalty,
            best_of: this.settings.bestOf,
            logit_bias: this.settings.logitBias,
            user,
          },
          failedResponseHandler: failedOpenAICallResponseHandler,
          successfulResponseHandler: openaiResponseFormat.handler,
          abortSignal,
        });
      },
    });
  }

  get settingsForEvent(): Partial<OpenAICompletionModelSettings> {
    const eventSettingProperties: Array<string> = [
      ...textGenerationModelProperties,

      "suffix",
      "temperature",
      "topP",
      "logprobs",
      "echo",
      "presencePenalty",
      "frequencyPenalty",
      "bestOf",
      "logitBias",
      "seed",
    ] satisfies (keyof OpenAICompletionModelSettings)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  async doGenerateTexts(prompt: string, options?: FunctionOptions) {
    const response = await this.callAPI(prompt, {
      ...options,
      responseFormat: OpenAITextResponseFormat.json,
    });

    return {
      response,
      textGenerationResults: response.choices.map((choice) => {
        return {
          finishReason: this.translateFinishReason(choice.finish_reason),
          text: choice.text,
        };
      }),
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      },
    };
  }

  private translateFinishReason(
    finishReason: string | null | undefined
  ): TextGenerationFinishReason {
    switch (finishReason) {
      case "stop":
        return "stop";
      case "length":
        return "length";
      case "content_filter":
        return "content-filter";
      default:
        return "unknown";
    }
  }

  doStreamText(prompt: string, options?: FunctionOptions) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: OpenAITextResponseFormat.deltaIterable,
    });
  }

  extractTextDelta(delta: unknown) {
    const chunk = delta as OpenAICompletionStreamChunk;

    const firstChoice = chunk.choices[0];

    if (firstChoice.index > 0) {
      return undefined;
    }

    return chunk.choices[0].text;
  }

  /**
   * Returns this model with an instruction prompt template.
   */
  withInstructionPrompt() {
    return this.withPromptTemplate(instruction());
  }

  /**
   * Returns this model with a chat prompt template.
   */
  withChatPrompt(options?: { user?: string; assistant?: string }) {
    return this.withPromptTemplate(chat(options));
  }

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<INPUT_PROMPT, string>
  ): PromptTemplateTextStreamingModel<
    INPUT_PROMPT,
    string,
    OpenAICompletionModelSettings,
    this
  > {
    return new PromptTemplateTextStreamingModel({
      model: this.withSettings({
        stopSequences: [
          ...(this.settings.stopSequences ?? []),
          ...promptTemplate.stopSequences,
        ],
      }),
      promptTemplate,
    });
  }

  withSettings(additionalSettings: Partial<OpenAICompletionModelSettings>) {
    return new OpenAICompletionModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const OpenAICompletionResponseSchema = z.object({
  id: z.string(),
  choices: z.array(
    z.object({
      finish_reason: z
        .enum(["stop", "length", "content_filter"])
        .optional()
        .nullable(),
      index: z.number(),
      logprobs: z.nullable(z.any()),
      text: z.string(),
    })
  ),
  created: z.number(),
  model: z.string(),
  system_fingerprint: z.string().optional(),
  object: z.literal("text_completion"),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

export type OpenAICompletionResponse = z.infer<
  typeof OpenAICompletionResponseSchema
>;

const openaiCompletionStreamChunkSchema = zodSchema(
  z.object({
    choices: z.array(
      z.object({
        text: z.string(),
        finish_reason: z
          .enum(["stop", "length", "content_filter"])
          .optional()
          .nullable(),
        index: z.number(),
      })
    ),
    created: z.number(),
    id: z.string(),
    model: z.string(),
    system_fingerprint: z.string().optional(),
    object: z.literal("text_completion"),
  })
);

type OpenAICompletionStreamChunk =
  (typeof openaiCompletionStreamChunkSchema)["_type"];

export type OpenAITextResponseFormatType<T> = {
  stream: boolean;
  handler: ResponseHandler<T>;
};

export const OpenAITextResponseFormat = {
  /**
   * Returns the response as a JSON object.
   */
  json: {
    stream: false,
    handler: createJsonResponseHandler(OpenAICompletionResponseSchema),
  },

  /**
   * Returns an async iterable over the full deltas (all choices, including full current state at time of event)
   * of the response stream.
   */
  deltaIterable: {
    stream: true,
    handler: createEventSourceResponseHandler(
      openaiCompletionStreamChunkSchema
    ),
  },
};
