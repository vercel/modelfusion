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
  TextStreamingModel,
  textGenerationModelProperties,
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
import { OllamaTextGenerationSettings } from "./OllamaTextGenerationSettings.js";

export interface OllamaCompletionPrompt {
  /**
   * Text prompt.
   */
  prompt: string;

  /**
   Images. Supports base64-encoded `png` and `jpeg` images up to 100MB in size.
   */
  images?: Array<string>;
}

/**
 * Text generation model that uses the Ollama completion API.
 *
 * @see https://github.com/jmorganca/ollama/blob/main/docs/api.md#generate-a-completion
 */
export interface OllamaCompletionModelSettings<
  CONTEXT_WINDOW_SIZE extends number | undefined,
> extends OllamaTextGenerationSettings {
  api?: ApiConfiguration;

  /**
   * Specify the context window size of the model that you have loaded in your
   * Ollama server. (Default: 2048)
   */
  contextWindowSize?: CONTEXT_WINDOW_SIZE;

  /**
   * When set to true, no formatting will be applied to the prompt and no context
   * will be returned.
   */
  raw?: boolean;

  system?: string;
  context?: number[];
}

export class OllamaCompletionModel<
    CONTEXT_WINDOW_SIZE extends number | undefined,
  >
  extends AbstractModel<OllamaCompletionModelSettings<CONTEXT_WINDOW_SIZE>>
  implements
    TextStreamingModel<
      OllamaCompletionPrompt,
      OllamaCompletionModelSettings<CONTEXT_WINDOW_SIZE>
    >
{
  constructor(settings: OllamaCompletionModelSettings<CONTEXT_WINDOW_SIZE>) {
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
    prompt: OllamaCompletionPrompt,
    options: {
      responseFormat: OllamaCompletionResponseFormatType<RESPONSE>;
    } & FunctionOptions
  ): Promise<RESPONSE> {
    const { responseFormat } = options;
    const api = this.settings.api ?? new OllamaApiConfiguration();
    const abortSignal = options.run?.abortSignal;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl(`/api/generate`),
          headers: api.headers,
          body: {
            stream: responseFormat.stream,
            model: this.settings.model,
            prompt: prompt.prompt,
            images: prompt.images,
            format: this.settings.format,
            options: {
              mirostat: this.settings.mirostat,
              mirostat_eta: this.settings.mirostatEta,
              mirostat_tau: this.settings.mirostatTau,
              num_ctx: this.settings.contextWindowSize,
              num_gpu: this.settings.numGpu,
              num_gqa: this.settings.numGqa,
              num_predict: this.settings.maxGenerationTokens,
              num_threads: this.settings.numThreads,
              repeat_last_n: this.settings.repeatLastN,
              repeat_penalty: this.settings.repeatPenalty,
              seed: this.settings.seed,
              stop: this.settings.stopSequences,
              temperature: this.settings.temperature,
              tfs_z: this.settings.tfsZ,
              top_k: this.settings.topK,
              top_p: this.settings.topP,
            },
            system: this.settings.system,
            template: this.settings.template,
            context: this.settings.context,
            raw: this.settings.raw,
          },
          failedResponseHandler: failedOllamaCallResponseHandler,
          successfulResponseHandler: responseFormat.handler,
          abortSignal,
        }),
    });
  }

  get settingsForEvent(): Partial<
    OllamaCompletionModelSettings<CONTEXT_WINDOW_SIZE>
  > {
    const eventSettingProperties: Array<string> = [
      ...textGenerationModelProperties,

      "contextWindowSize",
      "temperature",
      "mirostat",
      "mirostatEta",
      "mirostatTau",
      "numGqa",
      "numGpu",
      "numThreads",
      "repeatLastN",
      "repeatPenalty",
      "seed",
      "tfsZ",
      "topK",
      "topP",
      "system",
      "template",
      "context",
      "format",
      "raw",
    ] satisfies (keyof OllamaCompletionModelSettings<CONTEXT_WINDOW_SIZE>)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  async doGenerateTexts(
    prompt: OllamaCompletionPrompt,
    options?: FunctionOptions
  ) {
    const response = await this.callAPI(prompt, {
      ...options,
      responseFormat: OllamaCompletionResponseFormat.json,
    });

    return {
      response,
      textGenerationResults: [
        {
          text: response.response,
          finishReason: "unknown" as const,
        },
      ],
    };
  }

  doStreamText(prompt: OllamaCompletionPrompt, options?: FunctionOptions) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: OllamaCompletionResponseFormat.deltaIterable,
    });
  }

  asToolCallGenerationModel<INPUT_PROMPT>(
    promptTemplate: ToolCallPromptTemplate<INPUT_PROMPT, OllamaCompletionPrompt>
  ) {
    return new TextGenerationToolCallModel({
      model: this,
      format: promptTemplate,
    });
  }

  asToolCallsOrTextGenerationModel<INPUT_PROMPT>(
    promptTemplate: ToolCallsOrGenerateTextPromptTemplate<
      INPUT_PROMPT,
      OllamaCompletionPrompt
    >
  ) {
    return new TextGenerationToolCallsOrGenerateTextModel({
      model: this,
      template: promptTemplate,
    });
  }

  withTextPrompt(): PromptTemplateTextStreamingModel<
    string,
    OllamaCompletionPrompt,
    OllamaCompletionModelSettings<CONTEXT_WINDOW_SIZE>,
    this
  > {
    return this.withPromptTemplate({
      format(prompt: string) {
        return { prompt: prompt };
      },
      stopSequences: [],
    });
  }

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<
      INPUT_PROMPT,
      OllamaCompletionPrompt
    >
  ): PromptTemplateTextStreamingModel<
    INPUT_PROMPT,
    OllamaCompletionPrompt,
    OllamaCompletionModelSettings<CONTEXT_WINDOW_SIZE>,
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
      OllamaCompletionModelSettings<CONTEXT_WINDOW_SIZE>
    >
  ) {
    return new OllamaCompletionModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const ollamaCompletionResponseSchema = z.object({
  done: z.literal(true),
  model: z.string(),
  created_at: z.string(),
  response: z.string(),
  total_duration: z.number(),
  load_duration: z.number().optional(),
  prompt_eval_count: z.number(),
  prompt_eval_duration: z.number().optional(),
  eval_count: z.number(),
  eval_duration: z.number(),
  context: z.array(z.number()).optional(),
});

export type OllamaCompletionResponse = z.infer<
  typeof ollamaCompletionResponseSchema
>;

const ollamaCompletionStreamSchema = new ZodSchema(
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
      load_duration: z.number().optional(),
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

export type OllamaCompletionDelta = {
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
    schema: ollamaCompletionStreamSchema,
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

export type OllamaCompletionResponseFormatType<T> = {
  stream: boolean;
  handler: ResponseHandler<T>;
};

export const OllamaCompletionResponseFormat = {
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
            ollamaCompletionResponseSchema,
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
    }) satisfies ResponseHandler<OllamaCompletionResponse>,
  } satisfies OllamaCompletionResponseFormatType<OllamaCompletionResponse>,

  /**
   * Returns an async iterable over the full deltas (all choices, including full current state at time of event)
   * of the response stream.
   */
  deltaIterable: {
    stream: true,
    handler: async ({ response }: { response: Response }) =>
      createOllamaFullDeltaIterableQueue(response.body!),
  } satisfies OllamaCompletionResponseFormatType<AsyncIterable<Delta<string>>>,
};
