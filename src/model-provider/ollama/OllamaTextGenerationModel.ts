import { z } from "zod";
import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import { ResponseHandler, postJsonToApi } from "../../core/api/postToApi.js";
import { ZodSchema } from "../../core/schema/ZodSchema.js";
import { safeParseJSON } from "../../core/schema/parseJSON.js";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { Delta } from "../../model-function/Delta.js";
import { PromptTemplateTextStreamingModel } from "../../model-function/generate-text/PromptTemplateTextStreamingModel.js";
import {
  TextGenerationModelSettings,
  TextStreamingModel,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { TextGenerationPromptTemplate } from "../../model-function/generate-text/TextGenerationPromptTemplate.js";
import {
  TextGenerationToolCallModel,
  ToolCallPromptTemplate,
} from "../../tool/generate-tool-call/TextGenerationToolCallModel.js";
import {
  TextGenerationToolCallsOrGenerateTextModel,
  ToolCallsOrGenerateTextPromptTemplate,
} from "../../tool/generate-tool-calls-or-text/TextGenerationToolCallsOrGenerateTextModel.js";
import { AsyncQueue } from "../../util/AsyncQueue.js";
import { parseJsonStream } from "../../util/streaming/parseJsonStream.js";
import { OllamaApiConfiguration } from "./OllamaApiConfiguration.js";
import { failedOllamaCallResponseHandler } from "./OllamaError.js";

/**
 * @see https://github.com/jmorganca/ollama/blob/main/docs/api.md#generate-a-completion
 */
export interface OllamaTextGenerationModelSettings<
  CONTEXT_WINDOW_SIZE extends number | undefined,
> extends TextGenerationModelSettings {
  api?: ApiConfiguration;

  /**
   * The name of the model to use. For example, 'mistral'.
   *
   * @see https://ollama.ai/library
   */
  model: string;

  /**
   * The temperature of the model. Increasing the temperature will make the model
   * answer more creatively. (Default: 0.8)
   */
  temperature?: number;

  /**
   * Specify the context window size of the model that you have loaded in your
   * Ollama server. (Default: 2048)
   */
  contextWindowSize?: CONTEXT_WINDOW_SIZE;

  /**
   * Enable Mirostat sampling for controlling perplexity.
   * (default: 0, 0 = disabled, 1 = Mirostat, 2 = Mirostat 2.0)
   */
  mirostat?: number;

  /**
   * Influences how quickly the algorithm responds to feedback from the generated text.
   * A lower learning rate will result in slower adjustments,
   * while a higher learning rate will make the algorithm more responsive. (Default: 0.1)
   */
  mirostat_eta?: number;

  /**
   * Controls the balance between coherence and diversity of the output.
   * A lower value will result in more focused and coherent text. (Default: 5.0)
   */
  mirostat_tau?: number;

  /**
   * The number of GQA groups in the transformer layer. Required for some models,
   * for example it is 8 for llama2:70b
   */
  num_gqa?: number;

  /**
   * The number of layers to send to the GPU(s). On macOS it defaults to 1 to
   * enable metal support, 0 to disable.
   */
  num_gpu?: number;

  /**
   * Sets the number of threads to use during computation. By default, Ollama will
   * detect this for optimal performance. It is recommended to set this value to the
   * number of physical CPU cores your system has (as opposed to the logical number of cores).
   */
  num_threads?: number;

  /**
   * Sets how far back for the model to look back to prevent repetition.
   * (Default: 64, 0 = disabled, -1 = num_ctx)
   */
  repeat_last_n?: number;

  /**
   * Sets how strongly to penalize repetitions. A higher value (e.g., 1.5)
   * will penalize repetitions more strongly, while a lower value (e.g., 0.9)
   * will be more lenient. (Default: 1.1)
   */
  repeat_penalty?: number;

  /**
   * Sets the random number seed to use for generation. Setting this to a
   * specific number will make the model generate the same text for the same prompt.
   * (Default: 0)
   */
  seed?: number;

  /**
   * Tail free sampling is used to reduce the impact of less probable tokens
   * from the output. A higher value (e.g., 2.0) will reduce the impact more,
   * while a value of 1.0 disables this setting. (default: 1)
   */
  tfs_z?: number;

  /**
   * Reduces the probability of generating nonsense. A higher value (e.g. 100)
   * will give more diverse answers, while a lower value (e.g. 10) will be more
   *  conservative. (Default: 40)
   */
  top_k?: number;

  /**
   * Works together with top-k. A higher value (e.g., 0.95) will lead to more
   * diverse text, while a lower value (e.g., 0.5) will generate more focused
   * and conservative text. (Default: 0.9)
   */
  top_p?: number;

  /**
   * When set to true, no formatting will be applied to the prompt and no context
   * will be returned.
   */
  raw?: boolean;

  /**
   * The format to return a response in. Currently the only accepted value is 'json'.
   * Leave undefined to return a string.
   */
  format?: "json";

  system?: string;
  template?: string;
  context?: number[];
}

export class OllamaTextGenerationModel<
    CONTEXT_WINDOW_SIZE extends number | undefined,
  >
  extends AbstractModel<OllamaTextGenerationModelSettings<CONTEXT_WINDOW_SIZE>>
  implements
    TextStreamingModel<
      string,
      OllamaTextGenerationModelSettings<CONTEXT_WINDOW_SIZE>
    >
{
  constructor(
    settings: OllamaTextGenerationModelSettings<CONTEXT_WINDOW_SIZE>
  ) {
    super({ settings });
  }

  readonly provider = "ollama";
  get modelName() {
    return this.settings.model;
  }

  readonly tokenizer = undefined;
  readonly countPromptTokens = undefined;

  get contextWindowSize(): CONTEXT_WINDOW_SIZE {
    return this.settings.contextWindowSize as CONTEXT_WINDOW_SIZE;
  }

  async callAPI<RESPONSE>(
    prompt: string,
    options: {
      responseFormat: OllamaTextGenerationResponseFormatType<RESPONSE>;
    } & FunctionOptions
  ): Promise<RESPONSE> {
    return callWithRetryAndThrottle({
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () =>
        callOllamaTextGenerationAPI({
          ...this.settings,

          // other
          abortSignal: options.run?.abortSignal,
          prompt,
          responseFormat: options.responseFormat,
        }),
    });
  }

  get settingsForEvent(): Partial<
    OllamaTextGenerationModelSettings<CONTEXT_WINDOW_SIZE>
  > {
    const eventSettingProperties: Array<string> = [
      "maxCompletionTokens",
      "stopSequences",
      "contextWindowSize",
      "temperature",
      "mirostat",
      "mirostat_eta",
      "mirostat_tau",
      "num_gqa",
      "num_gpu",
      "num_threads",
      "repeat_last_n",
      "repeat_penalty",
      "seed",
      "tfs_z",
      "top_k",
      "top_p",
      "system",
      "template",
      "context",
      "format",
      "raw",
    ] satisfies (keyof OllamaTextGenerationModelSettings<CONTEXT_WINDOW_SIZE>)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  async doGenerateText(prompt: string, options?: FunctionOptions) {
    const response = await this.callAPI(prompt, {
      ...options,
      responseFormat: OllamaTextGenerationResponseFormat.json,
    });

    return {
      response,
      text: response.response,
    };
  }

  doStreamText(prompt: string, options?: FunctionOptions) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: OllamaTextGenerationResponseFormat.deltaIterable,
    });
  }

  asToolCallGenerationModel<INPUT_PROMPT>(
    promptTemplate: ToolCallPromptTemplate<INPUT_PROMPT, string>
  ) {
    return new TextGenerationToolCallModel({
      model: this,
      format: promptTemplate,
    });
  }

  asToolCallsOrTextGenerationModel<INPUT_PROMPT>(
    promptTemplate: ToolCallsOrGenerateTextPromptTemplate<INPUT_PROMPT, string>
  ) {
    return new TextGenerationToolCallsOrGenerateTextModel({
      model: this,
      template: promptTemplate,
    });
  }

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<INPUT_PROMPT, string>
  ): PromptTemplateTextStreamingModel<
    INPUT_PROMPT,
    string,
    OllamaTextGenerationModelSettings<CONTEXT_WINDOW_SIZE>,
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

  withSettings(
    additionalSettings: Partial<
      OllamaTextGenerationModelSettings<CONTEXT_WINDOW_SIZE>
    >
  ) {
    return new OllamaTextGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const ollamaTextGenerationResponseSchema = z.object({
  done: z.literal(true),
  model: z.string(),
  response: z.string(),
  total_duration: z.number(),
  load_duration: z.number(),
  prompt_eval_count: z.number(),
  eval_count: z.number(),
  eval_duration: z.number(),
  context: z.array(z.number()).optional(),
});

export type OllamaTextGenerationResponse = z.infer<
  typeof ollamaTextGenerationResponseSchema
>;

const ollamaTextStreamingResponseSchema = new ZodSchema(
  z.discriminatedUnion("done", [
    z.object({
      done: z.literal(false),
      model: z.string(),
      created_at: z.string(),
      response: z.string(),
    }),
    z.object({
      done: z.literal(true),
      model: z.string(),
      created_at: z.string(),
      total_duration: z.number(),
      load_duration: z.number(),
      sample_count: z.number().optional(),
      sample_duration: z.number().optional(),
      prompt_eval_count: z.number(),
      prompt_eval_duration: z.number().optional(),
      eval_count: z.number(),
      eval_duration: z.number(),
      context: z.array(z.number()).optional(),
    }),
  ])
);

async function callOllamaTextGenerationAPI<RESPONSE>({
  api = new OllamaApiConfiguration(),
  abortSignal,
  responseFormat,
  prompt,
  model,
  format,
  contextWindowSize,
  maxCompletionTokens,
  mirostat,
  mirostat_eta,
  mirostat_tau,
  num_gpu,
  num_gqa,
  num_threads,
  repeat_last_n,
  repeat_penalty,
  seed,
  stopSequences,
  temperature,
  tfs_z,
  top_k,
  top_p,
  system,
  template,
  context,
  raw,
}: OllamaTextGenerationModelSettings<number> & {
  abortSignal?: AbortSignal;
  responseFormat: OllamaTextGenerationResponseFormatType<RESPONSE>;
  prompt: string;
}): Promise<RESPONSE> {
  return postJsonToApi({
    url: api.assembleUrl(`/api/generate`),
    headers: api.headers,
    body: {
      stream: responseFormat.stream,
      model,
      prompt,
      format,
      options: {
        mirostat,
        mirostat_eta,
        mirostat_tau,
        num_ctx: contextWindowSize,
        num_gpu,
        num_gqa,
        num_predict: maxCompletionTokens,
        num_threads,
        repeat_last_n,
        repeat_penalty,
        seed,
        stop: stopSequences,
        temperature,
        tfs_z,
        top_k,
        top_p,
      },
      system,
      template,
      context,
      raw,
    },
    failedResponseHandler: failedOllamaCallResponseHandler,
    successfulResponseHandler: responseFormat.handler,
    abortSignal,
  });
}

export type OllamaTextGenerationDelta = {
  content: string;
  isComplete: boolean;
  delta: string;
};

async function createOllamaFullDeltaIterableQueue(
  stream: ReadableStream<Uint8Array>
): Promise<AsyncIterable<Delta<string>>> {
  const queue = new AsyncQueue<Delta<string>>();

  let accumulatedText = "";

  // process the stream asynchonously (no 'await' on purpose):
  parseJsonStream({
    stream,
    schema: ollamaTextStreamingResponseSchema,
    process(event) {
      if (event.done === true) {
        queue.push({
          type: "delta",
          fullDelta: {
            content: accumulatedText,
            isComplete: true,
            delta: "",
          },
          valueDelta: "",
        });
      } else {
        accumulatedText += event.response;

        queue.push({
          type: "delta",
          fullDelta: {
            content: accumulatedText,
            isComplete: false,
            delta: event.response,
          },
          valueDelta: event.response,
        });
      }
    },
    onDone() {
      queue.close();
    },
  });

  return queue;
}

export type OllamaTextGenerationResponseFormatType<T> = {
  stream: boolean;
  handler: ResponseHandler<T>;
};

export const OllamaTextGenerationResponseFormat = {
  /**
   * Returns the response as a JSON object.
   */
  json: {
    stream: false,
    handler: (async ({ response, url, requestBodyValues }) => {
      const responseBody = await response.text();

      const parsedResult = safeParseJSON({
        text: responseBody,
        schema: new ZodSchema(
          z.union([
            ollamaTextGenerationResponseSchema,
            z.object({
              done: z.literal(false),
              model: z.string(),
              created_at: z.string(),
              response: z.string(),
            }),
          ])
        ),
      });

      if (!parsedResult.success) {
        throw new ApiCallError({
          message: "Invalid JSON response",
          cause: parsedResult.error,
          statusCode: response.status,
          responseBody,
          url,
          requestBodyValues,
        });
      }

      if (parsedResult.data.done === false) {
        throw new ApiCallError({
          message: "Incomplete Ollama response received",
          statusCode: response.status,
          responseBody,
          url,
          requestBodyValues,
          isRetryable: true,
        });
      }

      return parsedResult.data;
    }) satisfies ResponseHandler<OllamaTextGenerationResponse>,
  } satisfies OllamaTextGenerationResponseFormatType<OllamaTextGenerationResponse>,

  /**
   * Returns an async iterable over the full deltas (all choices, including full current state at time of event)
   * of the response stream.
   */
  deltaIterable: {
    stream: true,
    handler: async ({ response }: { response: Response }) =>
      createOllamaFullDeltaIterableQueue(response.body!),
  } satisfies OllamaTextGenerationResponseFormatType<
    AsyncIterable<Delta<string>>
  >,
};
