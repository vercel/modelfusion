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
import { TextGenerationModelSettings } from "../../model-function/generate-text/TextGenerationModel.js";
import { TextGenerationFinishReason } from "../../model-function/generate-text/TextGenerationResult.js";
import { createEventSourceResponseHandler } from "../../util/streaming/createEventSourceResponseHandler.js";
import { OpenAIApiConfiguration } from "./OpenAIApiConfiguration.js";
import { failedOpenAICallResponseHandler } from "./OpenAIError.js";

export interface AbstractOpenAICompletionModelSettings
  extends TextGenerationModelSettings {
  api?: ApiConfiguration;

  model: string;

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

  isUserIdForwardingEnabled?: boolean;
}

/**
 * Abstract completion model that calls an API that is compatible with the OpenAI completions API.
 *
 * @see https://platform.openai.com/docs/api-reference/completions/create
 */
export abstract class AbstractOpenAICompletionModel<
  SETTINGS extends AbstractOpenAICompletionModelSettings,
> extends AbstractModel<SETTINGS> {
  constructor(settings: SETTINGS) {
    super({ settings });
  }

  async callAPI<RESULT>(
    prompt: string,
    callOptions: FunctionCallOptions,
    options: {
      responseFormat: OpenAITextResponseFormatType<RESULT>;
    }
  ): Promise<RESULT> {
    const api = this.settings.api ?? new OpenAIApiConfiguration();
    const user = this.settings.isUserIdForwardingEnabled
      ? callOptions.run?.userId
      : undefined;
    const abortSignal = callOptions.run?.abortSignal;
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
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl("/completions"),
          headers: api.headers({
            functionType: callOptions.functionType,
            functionId: callOptions.functionId,
            run: callOptions.run,
            callId: callOptions.callId,
          }),
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
        }),
    });
  }

  async doGenerateTexts(prompt: string, options: FunctionCallOptions) {
    return this.processTextGenerationResponse(
      await this.callAPI(prompt, options, {
        responseFormat: OpenAITextResponseFormat.json,
      })
    );
  }

  restoreGeneratedTexts(rawResponse: unknown) {
    return this.processTextGenerationResponse(
      validateTypes({
        structure: rawResponse,
        schema: zodSchema(OpenAICompletionResponseSchema),
      })
    );
  }

  private processTextGenerationResponse(rawResponse: OpenAICompletionResponse) {
    return {
      rawResponse,
      textGenerationResults: rawResponse.choices.map((choice) => {
        return {
          finishReason: this.translateFinishReason(choice.finish_reason),
          text: choice.text,
        };
      }),
      usage: {
        promptTokens: rawResponse.usage.prompt_tokens,
        completionTokens: rawResponse.usage.completion_tokens,
        totalTokens: rawResponse.usage.total_tokens,
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

  doStreamText(prompt: string, options: FunctionCallOptions) {
    return this.callAPI(prompt, options, {
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

  withJsonOutput(): this {
    return this;
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

const openaiCompletionStreamChunkSchema = z.object({
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
});

type OpenAICompletionStreamChunk = z.infer<
  typeof openaiCompletionStreamChunkSchema
>;

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
    handler: createJsonResponseHandler(
      zodSchema(OpenAICompletionResponseSchema)
    ),
  },

  /**
   * Returns an async iterable over the full deltas (all choices, including full current state at time of event)
   * of the response stream.
   */
  deltaIterable: {
    stream: true,
    handler: createEventSourceResponseHandler(
      zodSchema(openaiCompletionStreamChunkSchema)
    ),
  },
};
