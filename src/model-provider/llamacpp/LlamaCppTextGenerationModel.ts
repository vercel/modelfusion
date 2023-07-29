import SecureJSON from "secure-json-parse";
import z from "zod";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { FunctionOptions } from "../../model-function/FunctionOptions.js";
import { AsyncQueue } from "../../model-function/generate-text/AsyncQueue.js";
import { DeltaEvent } from "../../model-function/generate-text/DeltaEvent.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { parseEventSourceReadableStream } from "../../model-function/generate-text/parseEventSourceReadableStream.js";
import { PromptMapping } from "../../prompt/PromptMapping.js";
import { PromptMappingTextGenerationModel } from "../../prompt/PromptMappingTextGenerationModel.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  ResponseHandler,
  createJsonResponseHandler,
  postJsonToApi,
} from "../../util/api/postToApi.js";
import { failedLlamaCppCallResponseHandler } from "./LlamaCppError.js";
import { LlamaCppTokenizer } from "./LlamaCppTokenizer.js";

export interface LlamaCppTextGenerationModelSettings
  extends TextGenerationModelSettings {
  baseUrl?: string;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;

  tokenizerSettings?: {
    retry?: RetryFunction;
    throttle?: ThrottleFunction;
  };

  /**
   * Specify the context window size of the model that you have loaded in your
   * Llama.cpp server.
   */
  contextWindowSize?: number;

  temperature?: number;
  topK?: number;
  topP?: number;
  nPredict?: number;
  nKeep?: number;
  stop?: string[];
  tfsZ?: number;
  typicalP?: number;
  repeatPenalty?: number;
  repeatLastN?: number;
  penalizeNl?: boolean;
  mirostat?: number;
  mirostatTau?: number;
  mirostatEta?: number;
  seed?: number;
  ignoreEos?: boolean;
  logitBias?: Array<[number, number | false]>;
}

export class LlamaCppTextGenerationModel
  extends AbstractModel<LlamaCppTextGenerationModelSettings>
  implements
    TextGenerationModel<
      string,
      LlamaCppTextGenerationResponse,
      LlamaCppTextGenerationDelta,
      LlamaCppTextGenerationModelSettings
    >
{
  constructor(settings: LlamaCppTextGenerationModelSettings) {
    super({ settings });

    this.tokenizer = new LlamaCppTokenizer({
      baseUrl: this.settings.baseUrl,
      retry: this.settings.tokenizerSettings?.retry,
      throttle: this.settings.tokenizerSettings?.throttle,
    });
  }

  readonly provider = "llamacpp";
  get modelName() {
    return null;
  }

  get contextWindowSize() {
    return this.settings.contextWindowSize;
  }

  readonly tokenizer: LlamaCppTokenizer;

  async callAPI<RESPONSE>(
    prompt: string,
    options: {
      responseFormat: LlamaCppTextGenerationResponseFormatType<RESPONSE>;
    } & FunctionOptions<LlamaCppTextGenerationModelSettings>
  ): Promise<RESPONSE> {
    const { run, settings, responseFormat } = options;

    const callSettings = Object.assign(this.settings, settings, {
      abortSignal: run?.abortSignal,
      prompt,
      responseFormat,
    });

    return callWithRetryAndThrottle({
      retry: this.settings.retry,
      throttle: this.settings.throttle,
      call: async () => callLlamaCppTextGenerationAPI(callSettings),
    });
  }

  async countPromptTokens(prompt: string): Promise<number> {
    const tokens = await this.tokenizer.tokenize(prompt);
    return tokens.length;
  }

  generateTextResponse(
    prompt: string,
    options?: FunctionOptions<LlamaCppTextGenerationModelSettings>
  ) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: LlamaCppTextGenerationResponseFormat.json,
    });
  }

  extractText(response: LlamaCppTextGenerationResponse): string {
    return response.content;
  }

  generateDeltaStreamResponse(
    prompt: string,
    options?: FunctionOptions<LlamaCppTextGenerationModelSettings>
  ) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: LlamaCppTextGenerationResponseFormat.deltaIterable,
    });
  }

  extractTextDelta(fullDelta: LlamaCppTextGenerationDelta): string | undefined {
    return fullDelta.delta;
  }

  mapPrompt<INPUT_PROMPT>(promptMapping: PromptMapping<INPUT_PROMPT, string>) {
    return new PromptMappingTextGenerationModel<
      INPUT_PROMPT,
      string,
      LlamaCppTextGenerationResponse,
      LlamaCppTextGenerationDelta,
      LlamaCppTextGenerationModelSettings,
      this
    >({
      model: this.withStopTokens(promptMapping.stopTokens),
      promptMapping,
    });
  }

  withSettings(
    additionalSettings: Partial<LlamaCppTextGenerationModelSettings>
  ) {
    return new LlamaCppTextGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }

  withMaxTokens(maxTokens: number) {
    return this.withSettings({ nPredict: maxTokens });
  }

  withStopTokens(stopTokens: string[]) {
    return this.withSettings({ stop: stopTokens });
  }
}

const llamaCppTextGenerationResponseSchema = z.object({
  content: z.string(),
  stop: z.literal(true),
  generation_settings: z.object({
    frequency_penalty: z.number(),
    ignore_eos: z.boolean(),
    logit_bias: z.array(z.number()),
    mirostat: z.number(),
    mirostat_eta: z.number(),
    mirostat_tau: z.number(),
    model: z.string(),
    n_ctx: z.number(),
    n_keep: z.number(),
    n_predict: z.number(),
    n_probs: z.number(),
    penalize_nl: z.boolean(),
    presence_penalty: z.number(),
    repeat_last_n: z.number(),
    repeat_penalty: z.number(),
    seed: z.number(),
    stop: z.array(z.string()),
    stream: z.boolean(),
    temp: z.number(),
    tfs_z: z.number(),
    top_k: z.number(),
    top_p: z.number(),
    typical_p: z.number(),
  }),
  model: z.string(),
  prompt: z.string(),
  stopped_eos: z.boolean(),
  stopped_limit: z.boolean(),
  stopped_word: z.boolean(),
  stopping_word: z.string(),
  timings: z.object({
    predicted_ms: z.number(),
    predicted_n: z.number(),
    predicted_per_second: z.number().nullable(),
    predicted_per_token_ms: z.number().nullable(),
    prompt_ms: z.number().nullable(),
    prompt_n: z.number(),
    prompt_per_second: z.number().nullable(),
    prompt_per_token_ms: z.number().nullable(),
  }),
  tokens_cached: z.number(),
  tokens_evaluated: z.number(),
  tokens_predicted: z.number(),
  truncated: z.boolean(),
});

export type LlamaCppTextGenerationResponse = z.infer<
  typeof llamaCppTextGenerationResponseSchema
>;

const llamaCppTextStreamingResponseSchema = z.discriminatedUnion("stop", [
  z.object({
    content: z.string(),
    stop: z.literal(false),
  }),
  llamaCppTextGenerationResponseSchema,
]);

async function callLlamaCppTextGenerationAPI<RESPONSE>({
  baseUrl = "http://127.0.0.1:8080",
  abortSignal,
  responseFormat,
  prompt,
  temperature,
  topK,
  topP,
  nPredict,
  nKeep,
  stop,
  tfsZ,
  typicalP,
  repeatPenalty,
  repeatLastN,
  penalizeNl,
  mirostat,
  mirostatTau,
  mirostatEta,
  seed,
  ignoreEos,
  logitBias,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  responseFormat: LlamaCppTextGenerationResponseFormatType<RESPONSE>;
  prompt: string;
  temperature?: number;
  topK?: number;
  topP?: number;
  nPredict?: number;
  nKeep?: number;
  stop?: string[];
  tfsZ?: number;
  typicalP?: number;
  repeatPenalty?: number;
  repeatLastN?: number;
  penalizeNl?: boolean;
  mirostat?: number;
  mirostatTau?: number;
  mirostatEta?: number;
  seed?: number;
  ignoreEos?: boolean;
  logitBias?: Array<[number, number | false]>;
}): Promise<RESPONSE> {
  return postJsonToApi({
    url: `${baseUrl}/completion`,
    body: {
      stream: responseFormat.stream,
      prompt,
      temperature,
      top_k: topK,
      top_p: topP,
      n_predict: nPredict,
      n_keep: nKeep,
      stop,
      tfs_z: tfsZ,
      typical_p: typicalP,
      repeat_penalty: repeatPenalty,
      repeat_last_n: repeatLastN,
      penalize_nl: penalizeNl,
      mirostat,
      mirostat_tau: mirostatTau,
      mirostat_eta: mirostatEta,
      seed,
      ignore_eos: ignoreEos,
      logit_bias: logitBias,
    },
    failedResponseHandler: failedLlamaCppCallResponseHandler,
    successfulResponseHandler: responseFormat.handler,
    abortSignal,
  });
}

export type LlamaCppTextGenerationDelta = {
  content: string;
  isComplete: boolean;
  delta: string;
};

async function createLlamaCppFullDeltaIterableQueue(
  stream: ReadableStream<Uint8Array>
): Promise<AsyncIterable<DeltaEvent<LlamaCppTextGenerationDelta>>> {
  const queue = new AsyncQueue<DeltaEvent<LlamaCppTextGenerationDelta>>();

  let content = "";

  // process the stream asynchonously (no 'await' on purpose):
  parseEventSourceReadableStream({
    stream,
    callback: (event) => {
      if (event.type !== "event") {
        return;
      }

      const data = event.data;

      try {
        const json = SecureJSON.parse(data);
        const parseResult = llamaCppTextStreamingResponseSchema.safeParse(json);

        if (!parseResult.success) {
          queue.push({
            type: "error",
            error: parseResult.error,
          });
          queue.close();
          return;
        }

        const event = parseResult.data;

        content += event.content;

        queue.push({
          type: "delta",
          fullDelta: {
            content,
            isComplete: event.stop,
            delta: event.content,
          },
        });

        if (event.stop) {
          queue.close();
        }
      } catch (error) {
        queue.push({ type: "error", error });
        queue.close();
        return;
      }
    },
  });

  return queue;
}

export type LlamaCppTextGenerationResponseFormatType<T> = {
  stream: boolean;
  handler: ResponseHandler<T>;
};

export const LlamaCppTextGenerationResponseFormat = {
  /**
   * Returns the response as a JSON object.
   */
  json: {
    stream: false,
    handler: createJsonResponseHandler(llamaCppTextGenerationResponseSchema),
  } satisfies LlamaCppTextGenerationResponseFormatType<LlamaCppTextGenerationResponse>,

  /**
   * Returns an async iterable over the full deltas (all choices, including full current state at time of event)
   * of the response stream.
   */
  deltaIterable: {
    stream: true,
    handler: async ({ response }: { response: Response }) =>
      createLlamaCppFullDeltaIterableQueue(response.body!),
  } satisfies LlamaCppTextGenerationResponseFormatType<
    AsyncIterable<DeltaEvent<LlamaCppTextGenerationDelta>>
  >,
};
