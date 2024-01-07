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
import { validateTypes } from "../../core/schema/validateTypes.js";
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
import { createJsonStreamResponseHandler } from "../../util/streaming/createJsonStreamResponseHandler.js";
import { CohereApiConfiguration } from "./CohereApiConfiguration.js";
import { failedCohereCallResponseHandler } from "./CohereError.js";
import { CohereTokenizer } from "./CohereTokenizer.js";

export const COHERE_TEXT_GENERATION_MODELS = {
  command: {
    contextWindowSize: 4096,
  },
  "command-light": {
    contextWindowSize: 4096,
  },
};

export type CohereTextGenerationModelType =
  keyof typeof COHERE_TEXT_GENERATION_MODELS;

export interface CohereTextGenerationModelSettings
  extends TextGenerationModelSettings {
  api?: ApiConfiguration;

  model: CohereTextGenerationModelType;

  temperature?: number;
  k?: number;
  p?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  returnLikelihoods?: "GENERATION" | "ALL" | "NONE";
  logitBias?: Record<string, number>;
  truncate?: "NONE" | "START" | "END";

  cohereStopSequences?: string[]; // renamed because of conflict with stopSequences
}

/**
 * Create a text generation model that calls the Cohere Co.Generate API.
 *
 * @see https://docs.cohere.com/reference/generate
 *
 * @example
 * const model = new CohereTextGenerationModel({
 *   model: "command",
 *   temperature: 0.7,
 *   maxGenerationTokens: 500,
 * });
 *
 * const text = await generateText(
 *    model,
 *   "Write a short story about a robot learning to love:\n\n"
 * );
 */
export class CohereTextGenerationModel
  extends AbstractModel<CohereTextGenerationModelSettings>
  implements TextStreamingModel<string, CohereTextGenerationModelSettings>
{
  constructor(settings: CohereTextGenerationModelSettings) {
    super({ settings });

    this.contextWindowSize =
      COHERE_TEXT_GENERATION_MODELS[this.settings.model].contextWindowSize;

    this.tokenizer = new CohereTokenizer({
      api: this.settings.api,
      model: this.settings.model,
    });
  }

  readonly provider = "cohere" as const;
  get modelName() {
    return this.settings.model;
  }

  readonly contextWindowSize: number;
  readonly tokenizer: CohereTokenizer;

  async countPromptTokens(input: string) {
    return countTokens(this.tokenizer, input);
  }

  async callAPI<RESPONSE>(
    prompt: string,
    callOptions: FunctionCallOptions,
    options: {
      responseFormat: CohereTextGenerationResponseFormatType<RESPONSE>;
    }
  ): Promise<RESPONSE> {
    const api = this.settings.api ?? new CohereApiConfiguration();
    const responseFormat = options.responseFormat;
    const abortSignal = callOptions.run?.abortSignal;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl(`/generate`),
          headers: api.headers({
            functionType: callOptions.functionType,
            functionId: callOptions.functionId,
            run: callOptions.run,
            callId: callOptions.callId,
          }),
          body: {
            stream: responseFormat.stream,
            model: this.settings.model,
            prompt,
            num_generations: this.settings.numberOfGenerations,
            max_tokens: this.settings.maxGenerationTokens,
            temperature: this.settings.temperature,
            k: this.settings.k,
            p: this.settings.p,
            frequency_penalty: this.settings.frequencyPenalty,
            presence_penalty: this.settings.presencePenalty,
            end_sequences: this.settings.stopSequences,
            stop_sequences: this.settings.cohereStopSequences,
            return_likelihoods: this.settings.returnLikelihoods,
            logit_bias: this.settings.logitBias,
            truncate: this.settings.truncate,
          },
          failedResponseHandler: failedCohereCallResponseHandler,
          successfulResponseHandler: responseFormat.handler,
          abortSignal,
        }),
    });
  }

  get settingsForEvent(): Partial<CohereTextGenerationModelSettings> {
    const eventSettingProperties: Array<string> = [
      ...textGenerationModelProperties,

      "temperature",
      "k",
      "p",
      "frequencyPenalty",
      "presencePenalty",
      "returnLikelihoods",
      "logitBias",
      "truncate",
      "cohereStopSequences",
    ] satisfies (keyof CohereTextGenerationModelSettings)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  async doGenerateTexts(prompt: string, options: FunctionCallOptions) {
    return this.processTextGenerationResponse(
      await this.callAPI(prompt, options, {
        responseFormat: CohereTextGenerationResponseFormat.json,
      })
    );
  }

  restoreGeneratedTexts(rawResponse: unknown) {
    return this.processTextGenerationResponse(
      validateTypes({
        structure: rawResponse,
        schema: zodSchema(cohereTextGenerationResponseSchema),
      })
    );
  }

  processTextGenerationResponse(rawResponse: CohereTextGenerationResponse) {
    return {
      rawResponse,
      textGenerationResults: rawResponse.generations.map((generation) => ({
        text: generation.text,
        finishReason: this.translateFinishReason(generation.finish_reason),
      })),
    };
  }

  private translateFinishReason(
    finishReason: string | null | undefined
  ): TextGenerationFinishReason {
    switch (finishReason) {
      case "COMPLETE":
        return "stop";
      case "MAX_TOKENS":
        return "length";
      case "ERROR_TOXIC":
        return "content-filter";
      case "ERROR":
        return "error";
      default:
        return "unknown";
    }
  }

  doStreamText(prompt: string, options: FunctionCallOptions) {
    return this.callAPI(prompt, options, {
      responseFormat: CohereTextGenerationResponseFormat.deltaIterable,
    });
  }

  extractTextDelta(delta: unknown) {
    const chunk = delta as CohereTextStreamChunk;
    return chunk.is_finished === true ? "" : chunk.text;
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

  withJsonOutput(): this {
    return this;
  }

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<INPUT_PROMPT, string>
  ): PromptTemplateTextStreamingModel<
    INPUT_PROMPT,
    string,
    CohereTextGenerationModelSettings,
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

  withSettings(additionalSettings: Partial<CohereTextGenerationModelSettings>) {
    return new CohereTextGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const cohereTextGenerationResponseSchema = z.object({
  id: z.string(),
  generations: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      finish_reason: z.string().optional(),
    })
  ),
  prompt: z.string(),
  meta: z
    .object({
      api_version: z.object({
        version: z.string(),
      }),
    })
    .optional(),
});

export type CohereTextGenerationResponse = z.infer<
  typeof cohereTextGenerationResponseSchema
>;

const cohereTextStreamChunkSchema = z.discriminatedUnion("is_finished", [
  z.object({
    text: z.string(),
    is_finished: z.literal(false),
  }),
  z.object({
    is_finished: z.literal(true),
    finish_reason: z.string(),
    response: cohereTextGenerationResponseSchema,
  }),
]);

export type CohereTextStreamChunk = z.infer<typeof cohereTextStreamChunkSchema>;

export type CohereTextGenerationResponseFormatType<T> = {
  stream: boolean;
  handler: ResponseHandler<T>;
};

export const CohereTextGenerationResponseFormat = {
  /**
   * Returns the response as a JSON object.
   */
  json: {
    stream: false,
    handler: createJsonResponseHandler(
      zodSchema(cohereTextGenerationResponseSchema)
    ),
  },

  /**
   * Returns an async iterable over the full deltas (all choices, including full current state at time of event)
   * of the response stream.
   */
  deltaIterable: {
    stream: true,
    handler: createJsonStreamResponseHandler(
      zodSchema(cohereTextStreamChunkSchema)
    ),
  },
};
