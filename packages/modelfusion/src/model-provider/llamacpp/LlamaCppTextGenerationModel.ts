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
import { parseJSON } from "../../core/schema/parseJSON.js";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { Delta } from "../../model-function/Delta.js";
import { PromptTemplateTextStreamingModel } from "../../model-function/generate-text/PromptTemplateTextStreamingModel.js";
import {
  TextGenerationModelSettings,
  TextStreamingModel,
  textGenerationModelProperties,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { TextGenerationPromptTemplate } from "../../model-function/generate-text/TextGenerationPromptTemplate.js";
import { AsyncQueue } from "../../util/AsyncQueue.js";
import { parseEventSourceStream } from "../../util/streaming/parseEventSourceStream.js";
import { LlamaCppApiConfiguration } from "./LlamaCppApiConfiguration.js";
import { failedLlamaCppCallResponseHandler } from "./LlamaCppError.js";
import { LlamaCppTokenizer } from "./LlamaCppTokenizer.js";

export interface LlamaCppTextGenerationModelSettings<
  CONTEXT_WINDOW_SIZE extends number | undefined,
> extends TextGenerationModelSettings {
  api?: ApiConfiguration;

  /**
   * Specify the context window size of the model that you have loaded in your
   * Llama.cpp server.
   */
  contextWindowSize?: CONTEXT_WINDOW_SIZE;

  /**
   * Save the prompt and generation for avoid reprocess entire prompt if a part of this isn't change (default: false)
   */
  cachePrompt?: boolean;

  temperature?: number;
  topK?: number;
  topP?: number;
  nKeep?: number;
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

export interface LlamaCppTextGenerationPrompt {
  /**
   * Text prompt. Images can be included through references such as `[img-ID]`, e.g. `[img-1]`.
   */
  text: string;

  /**
   * Maps image id to image base data.
   */
  images?: Record<number, string>;
}

export class LlamaCppTextGenerationModel<
    CONTEXT_WINDOW_SIZE extends number | undefined,
  >
  extends AbstractModel<
    LlamaCppTextGenerationModelSettings<CONTEXT_WINDOW_SIZE>
  >
  implements
    TextStreamingModel<
      LlamaCppTextGenerationPrompt,
      LlamaCppTextGenerationModelSettings<CONTEXT_WINDOW_SIZE>
    >
{
  constructor(
    settings: LlamaCppTextGenerationModelSettings<CONTEXT_WINDOW_SIZE> = {}
  ) {
    super({ settings });
    this.tokenizer = new LlamaCppTokenizer(this.settings.api);
  }

  readonly provider = "llamacpp";
  get modelName() {
    return null;
  }

  get contextWindowSize(): CONTEXT_WINDOW_SIZE {
    return this.settings.contextWindowSize as CONTEXT_WINDOW_SIZE;
  }

  readonly tokenizer: LlamaCppTokenizer;

  async callAPI<RESPONSE>(
    prompt: LlamaCppTextGenerationPrompt,
    options: {
      responseFormat: LlamaCppTextGenerationResponseFormatType<RESPONSE>;
    } & FunctionOptions
  ): Promise<RESPONSE> {
    const api = this.settings.api ?? new LlamaCppApiConfiguration();
    const responseFormat = options.responseFormat;
    const abortSignal = options.run?.abortSignal;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl(`/completion`),
          headers: api.headers,
          body: {
            stream: responseFormat.stream,
            prompt: prompt.text,
            image_data:
              prompt.images != null
                ? Object.entries(prompt.images).map(([id, data]) => ({
                    id: +id,
                    data,
                  }))
                : undefined,
            cache_prompt: this.settings.cachePrompt,
            temperature: this.settings.temperature,
            top_k: this.settings.topK,
            top_p: this.settings.topP,
            n_predict: this.settings.maxGenerationTokens,
            n_keep: this.settings.nKeep,
            stop: this.settings.stopSequences,
            tfs_z: this.settings.tfsZ,
            typical_p: this.settings.typicalP,
            repeat_penalty: this.settings.repeatPenalty,
            repeat_last_n: this.settings.repeatLastN,
            penalize_nl: this.settings.penalizeNl,
            mirostat: this.settings.mirostat,
            mirostat_tau: this.settings.mirostatTau,
            mirostat_eta: this.settings.mirostatEta,
            seed: this.settings.seed,
            ignore_eos: this.settings.ignoreEos,
            logit_bias: this.settings.logitBias,
          },
          failedResponseHandler: failedLlamaCppCallResponseHandler,
          successfulResponseHandler: responseFormat.handler,
          abortSignal,
        }),
    });
  }

  get settingsForEvent(): Partial<
    LlamaCppTextGenerationModelSettings<CONTEXT_WINDOW_SIZE>
  > {
    const eventSettingProperties: Array<string> = [
      ...textGenerationModelProperties,

      "contextWindowSize",
      "cachePrompt",
      "temperature",
      "topK",
      "topP",
      "nKeep",
      "tfsZ",
      "typicalP",
      "repeatPenalty",
      "repeatLastN",
      "penalizeNl",
      "mirostat",
      "mirostatTau",
      "mirostatEta",
      "seed",
      "ignoreEos",
      "logitBias",
    ] satisfies (keyof LlamaCppTextGenerationModelSettings<CONTEXT_WINDOW_SIZE>)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  async countPromptTokens(
    prompt: LlamaCppTextGenerationPrompt
  ): Promise<number> {
    const tokens = await this.tokenizer.tokenize(prompt.text);
    return tokens.length;
  }

  async doGenerateTexts(
    prompt: LlamaCppTextGenerationPrompt,
    options?: FunctionOptions
  ) {
    const response = await this.callAPI(prompt, {
      ...options,
      responseFormat: LlamaCppTextGenerationResponseFormat.json,
    });

    return {
      response,
      textGenerationResults: [
        {
          text: response.content,
          finishReason:
            response.stopped_eos || response.stopped_word
              ? ("stop" as const)
              : response.stopped_limit
                ? ("length" as const)
                : ("unknown" as const),
        },
      ],
      usage: {
        promptTokens: response.tokens_evaluated,
        completionTokens: response.tokens_predicted,
        totalTokens: response.tokens_evaluated + response.tokens_predicted,
      },
    };
  }

  doStreamText(
    prompt: LlamaCppTextGenerationPrompt,
    options?: FunctionOptions
  ) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: LlamaCppTextGenerationResponseFormat.deltaIterable,
    });
  }

  extractTextDelta(delta: unknown) {
    return (delta as LlamaCppTextStreamChunk).content;
  }

  withTextPrompt(): PromptTemplateTextStreamingModel<
    string,
    LlamaCppTextGenerationPrompt,
    LlamaCppTextGenerationModelSettings<CONTEXT_WINDOW_SIZE>,
    this
  > {
    return this.withPromptTemplate({
      format(prompt: string) {
        return { text: prompt };
      },
      stopSequences: [],
    });
  }

  /**
   * Maps the prompt for a text version of the Llama.cpp prompt template (without image support).
   */
  withTextPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<INPUT_PROMPT, string>
  ): PromptTemplateTextStreamingModel<
    INPUT_PROMPT,
    string,
    LlamaCppTextGenerationModelSettings<CONTEXT_WINDOW_SIZE>,
    PromptTemplateTextStreamingModel<
      string,
      LlamaCppTextGenerationPrompt,
      LlamaCppTextGenerationModelSettings<CONTEXT_WINDOW_SIZE>,
      this
    >
  > {
    return new PromptTemplateTextStreamingModel({
      model: this.withTextPrompt().withSettings({
        stopSequences: [
          ...(this.settings.stopSequences ?? []),
          ...promptTemplate.stopSequences,
        ],
      }),
      promptTemplate,
    });
  }

  /**
   * Maps the prompt for the full Llama.cpp prompt template (incl. image support).
   */
  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<
      INPUT_PROMPT,
      LlamaCppTextGenerationPrompt
    >
  ): PromptTemplateTextStreamingModel<
    INPUT_PROMPT,
    LlamaCppTextGenerationPrompt,
    LlamaCppTextGenerationModelSettings<CONTEXT_WINDOW_SIZE>,
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
      LlamaCppTextGenerationModelSettings<CONTEXT_WINDOW_SIZE>
    >
  ) {
    return new LlamaCppTextGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
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
    temperature: z.number(),
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

const llamaCppTextStreamChunkSchema = zodSchema(
  z.discriminatedUnion("stop", [
    z.object({
      content: z.string(),
      stop: z.literal(false),
    }),
    llamaCppTextGenerationResponseSchema,
  ])
);

export type LlamaCppTextStreamChunk =
  (typeof llamaCppTextStreamChunkSchema)["_type"];

async function createLlamaCppFullDeltaIterableQueue(
  stream: ReadableStream<Uint8Array>
): Promise<AsyncIterable<Delta<LlamaCppTextStreamChunk>>> {
  const queue = new AsyncQueue<Delta<LlamaCppTextStreamChunk>>();

  // process the stream asynchonously (no 'await' on purpose):
  parseEventSourceStream({ stream })
    .then(async (events) => {
      try {
        for await (const event of events) {
          const data = event.data;

          const eventData = parseJSON({
            text: data,
            schema: llamaCppTextStreamChunkSchema,
          });

          queue.push({ type: "delta", deltaValue: eventData });

          if (eventData.stop) {
            queue.close();
          }
        }
      } catch (error) {
        queue.push({ type: "error", error });
        queue.close();
      }
    })
    .catch((error) => {
      queue.push({ type: "error", error });
      queue.close();
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
    AsyncIterable<Delta<LlamaCppTextStreamChunk>>
  >,
};
