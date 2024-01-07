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
import { createEventSourceResponseHandler } from "../../util/streaming/createEventSourceResponseHandler.js";
import { MistralApiConfiguration } from "./MistralApiConfiguration.js";
import { chat, instruction, text } from "./MistralChatPromptTemplate.js";
import { failedMistralCallResponseHandler } from "./MistralError.js";

export type MistralChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type MistralChatPrompt = Array<MistralChatMessage>;

export interface MistralChatModelSettings extends TextGenerationModelSettings {
  api?: ApiConfiguration;

  model: "mistral-tiny" | "mistral-small" | "mistral-medium";

  /**
   * What sampling temperature to use, between 0.0 and 2.0.
   * Higher values like 0.8 will make the output more random,
   * while lower values like 0.2 will make it more focused and deterministic.
   *
   * We generally recommend altering this or top_p but not both.
   *
   * Default: 0.7
   */
  temperature?: number | null;

  /**
   * Nucleus sampling, where the model considers the results of the tokens
   * with top_p probability mass. So 0.1 means only the tokens comprising
   * the top 10% probability mass are considered.
   *
   * We generally recommend altering this or temperature but not both.
   *
   * Default: 1
   */
  topP?: number;

  /**
   * Whether to inject a safety prompt before all conversations.
   *
   * Default: false
   */
  safeMode?: boolean;

  /**
   * The seed to use for random sampling. If set, different calls will
   * generate deterministic results.
   */
  randomSeed?: number | null;
}

export class MistralChatModel
  extends AbstractModel<MistralChatModelSettings>
  implements TextStreamingModel<MistralChatPrompt, MistralChatModelSettings>
{
  constructor(settings: MistralChatModelSettings) {
    super({ settings });
  }

  readonly provider = "mistral";
  get modelName() {
    return this.settings.model;
  }

  readonly contextWindowSize = undefined;
  readonly tokenizer = undefined;
  readonly countPromptTokens = undefined;

  async callAPI<RESULT>(
    prompt: MistralChatPrompt,
    callOptions: FunctionCallOptions,
    options: {
      responseFormat: MistralChatResponseFormatType<RESULT>;
    }
  ) {
    const api = this.settings.api ?? new MistralApiConfiguration();
    const abortSignal = callOptions.run?.abortSignal;
    const stream = options.responseFormat.stream;
    const successfulResponseHandler = options.responseFormat.handler;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl(`/chat/completions`),
          headers: api.headers({
            functionType: callOptions.functionType,
            functionId: callOptions.functionId,
            run: callOptions.run,
            callId: callOptions.callId,
          }),
          body: {
            stream,
            messages: prompt,
            model: this.settings.model,
            temperature: this.settings.temperature,
            top_p: this.settings.topP,
            max_tokens: this.settings.maxGenerationTokens,
            safe_mode: this.settings.safeMode,
            random_seed: this.settings.randomSeed,
          },
          failedResponseHandler: failedMistralCallResponseHandler,
          successfulResponseHandler,
          abortSignal,
        }),
    });
  }

  get settingsForEvent(): Partial<MistralChatModelSettings> {
    const eventSettingProperties: Array<string> = [
      ...textGenerationModelProperties,

      "temperature",
      "topP",
      "safeMode",
      "randomSeed",
    ] satisfies (keyof MistralChatModelSettings)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  async doGenerateTexts(
    prompt: MistralChatPrompt,
    options: FunctionCallOptions
  ) {
    return this.processTextGenerationResponse(
      await this.callAPI(prompt, options, {
        responseFormat: MistralChatResponseFormat.json,
      })
    );
  }

  restoreGeneratedTexts(rawResponse: unknown) {
    return this.processTextGenerationResponse(
      validateTypes({
        structure: rawResponse,
        schema: zodSchema(mistralChatResponseSchema),
      })
    );
  }

  processTextGenerationResponse(rawResponse: MistralChatResponse) {
    return {
      rawResponse,
      textGenerationResults: rawResponse.choices.map((choice) => ({
        text: choice.message.content,
        finishReason: this.translateFinishReason(choice.finish_reason),
      })),
    };
  }

  private translateFinishReason(
    finishReason: string | null | undefined
  ): TextGenerationFinishReason {
    switch (finishReason) {
      case "stop":
        return "stop";
      case "length":
      case "model_length":
        return "length";
      default:
        return "unknown";
    }
  }

  doStreamText(prompt: MistralChatPrompt, options: FunctionCallOptions) {
    return this.callAPI(prompt, options, {
      responseFormat: MistralChatResponseFormat.textDeltaIterable,
    });
  }

  extractTextDelta(delta: unknown) {
    const chunk = delta as MistralChatStreamChunk;
    return chunk.choices[0].delta.content ?? undefined;
  }

  /**
   * Returns this model with a text prompt template.
   */
  withTextPrompt() {
    return this.withPromptTemplate(text());
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
  withChatPrompt() {
    return this.withPromptTemplate(chat());
  }

  withJsonOutput(): this {
    return this;
  }

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<
      INPUT_PROMPT,
      MistralChatPrompt
    >
  ): PromptTemplateTextStreamingModel<
    INPUT_PROMPT,
    MistralChatPrompt,
    MistralChatModelSettings,
    this
  > {
    return new PromptTemplateTextStreamingModel({
      model: this, // stop tokens are not supported by this model
      promptTemplate,
    });
  }

  withSettings(additionalSettings: Partial<MistralChatModelSettings>) {
    return new MistralChatModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const mistralChatResponseSchema = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
      finish_reason: z.enum(["stop", "length", "model_length"]),
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

export type MistralChatResponse = z.infer<typeof mistralChatResponseSchema>;

const mistralChatStreamChunkSchema = z.object({
  id: z.string(),
  object: z.string().optional(),
  created: z.number().optional(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      delta: z.object({
        role: z.enum(["assistant", "user"]).optional().nullable(),
        content: z.string().nullable().optional(),
      }),
      finish_reason: z
        .enum(["stop", "length", "model_length"])
        .nullable()
        .optional(),
    })
  ),
});

export type MistralChatStreamChunk = z.infer<
  typeof mistralChatStreamChunkSchema
>;

export type MistralChatResponseFormatType<T> = {
  stream: boolean;
  handler: ResponseHandler<T>;
};

export const MistralChatResponseFormat = {
  /**
   * Returns the response as a JSON object.
   */
  json: {
    stream: false,
    handler: createJsonResponseHandler(zodSchema(mistralChatResponseSchema)),
  },

  /**
   * Returns an async iterable over the text deltas (only the tex different of the first choice).
   */
  textDeltaIterable: {
    stream: true,
    handler: createEventSourceResponseHandler(
      zodSchema(mistralChatStreamChunkSchema)
    ),
  },
};
