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
import { Delta } from "../../model-function/Delta.js";
import { PromptFormatTextStreamingModel } from "../../model-function/generate-text/PromptFormatTextStreamingModel.js";
import {
  TextGenerationModelSettings,
  TextStreamingModel,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { TextGenerationPromptFormat } from "../../model-function/generate-text/TextGenerationPromptFormat.js";
import { AsyncQueue } from "../../util/AsyncQueue.js";
import { parseJsonStream } from "../../util/streaming/parseJsonStream.js";
import { OllamaApiConfiguration } from "./OllamaApiConfiguration.js";
import { failedOllamaCallResponseHandler } from "./OllamaError.js";

export interface OllamaTextGenerationModelSettings<
  CONTEXT_WINDOW_SIZE extends number | undefined,
> extends TextGenerationModelSettings {
  api?: ApiConfiguration;

  model: string;

  temperature?: number;

  /**
   * Specify the context window size of the model that you have loaded in your
   * Ollama server.
   */
  contextWindowSize?: CONTEXT_WINDOW_SIZE;

  mirostat?: number;
  mirostat_eta?: number;
  mirostat_tau?: number;
  num_gqa?: number;
  num_gpu?: number;
  num_threads?: number;
  repeat_last_n?: number;
  repeat_penalty?: number;
  seed?: number;
  tfs_z?: number;
  top_k?: number;
  top_p?: number;

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

  withPromptFormat<INPUT_PROMPT>(
    promptFormat: TextGenerationPromptFormat<INPUT_PROMPT, string>
  ): PromptFormatTextStreamingModel<
    INPUT_PROMPT,
    string,
    OllamaTextGenerationModelSettings<CONTEXT_WINDOW_SIZE>,
    this
  > {
    return new PromptFormatTextStreamingModel({
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
  context: z.array(z.number()),
});

export type OllamaTextGenerationResponse = z.infer<
  typeof ollamaTextGenerationResponseSchema
>;

const ollamaTextStreamingResponseSchema = z.discriminatedUnion("done", [
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
    context: z.array(z.number()),
  }),
]);

async function callOllamaTextGenerationAPI<RESPONSE>({
  api = new OllamaApiConfiguration(),
  abortSignal,
  responseFormat,
  prompt,
  model,
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
    handler: createJsonResponseHandler(ollamaTextGenerationResponseSchema),
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
