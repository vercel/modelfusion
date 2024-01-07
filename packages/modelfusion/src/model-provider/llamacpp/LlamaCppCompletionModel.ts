import { z } from "zod";
import { FunctionCallOptions } from "../../core/FunctionOptions.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  ResponseHandler,
  createJsonResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi.js";
import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer.js";
import { Schema } from "../../core/schema/Schema.js";
import { zodSchema } from "../../core/schema/ZodSchema.js";
import { parseJSON } from "../../core/schema/parseJSON.js";
import { validateTypes } from "../../core/schema/validateTypes.js";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { Delta } from "../../model-function/Delta.js";
import {
  FlexibleStructureFromTextPromptTemplate,
  StructureFromTextPromptTemplate,
} from "../../model-function/generate-structure/StructureFromTextPromptTemplate.js";
import { StructureFromTextStreamingModel } from "../../model-function/generate-structure/StructureFromTextStreamingModel.js";
import { PromptTemplateTextStreamingModel } from "../../model-function/generate-text/PromptTemplateTextStreamingModel.js";
import {
  TextGenerationModelSettings,
  TextStreamingModel,
  textGenerationModelProperties,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { TextGenerationPromptTemplate } from "../../model-function/generate-text/TextGenerationPromptTemplate.js";
import { ChatPrompt } from "../../model-function/generate-text/prompt-template/ChatPrompt.js";
import { InstructionPrompt } from "../../model-function/generate-text/prompt-template/InstructionPrompt.js";
import { TextGenerationPromptTemplateProvider } from "../../model-function/generate-text/prompt-template/PromptTemplateProvider.js";
import { AsyncQueue } from "../../util/AsyncQueue.js";
import { parseEventSourceStream } from "../../util/streaming/parseEventSourceStream.js";
import { LlamaCppApiConfiguration } from "./LlamaCppApiConfiguration.js";
import { failedLlamaCppCallResponseHandler } from "./LlamaCppError.js";
import { Text } from "./LlamaCppPrompt.js";
import { LlamaCppTokenizer } from "./LlamaCppTokenizer.js";
import { convertJsonSchemaToGBNF } from "./convertJsonSchemaToGBNF.js";

export interface LlamaCppCompletionModelSettings<
  CONTEXT_WINDOW_SIZE extends number | undefined,
> extends TextGenerationModelSettings {
  api?: ApiConfiguration;

  /**
   * Specify the context window size of the model that you have loaded in your
   * Llama.cpp server.
   */
  contextWindowSize?: CONTEXT_WINDOW_SIZE;

  /**
   * Adjust the randomness of the generated text (default: 0.8).
   */
  temperature?: number;

  /**
   * Limit the next token selection to the K most probable tokens (default: 40).
   */
  topK?: number;

  /**
   * Limit the next token selection to a subset of tokens with a cumulative probability above a threshold P (default: 0.95).
   */
  topP?: number;

  /**
   * The minimum probability for a token to be considered, relative to the probability of the most likely token (default: 0.05).
   */
  minP?: number;

  /**
   * Specify the number of tokens from the prompt to retain when the context size is exceeded
   * and tokens need to be discarded. By default, this value is set to 0 (meaning no tokens
   * are kept). Use -1 to retain all tokens from the prompt.
   */
  nKeep?: number;

  /**
   * Enable tail free sampling with parameter z (default: 1.0, 1.0 = disabled).
   */
  tfsZ?: number;

  /**
   * Enable locally typical sampling with parameter p (default: 1.0, 1.0 = disabled).
   */
  typicalP?: number;

  /**
   * Control the repetition of token sequences in the generated text (default: 1.1).
   */
  repeatPenalty?: number;

  /**
   * Last n tokens to consider for penalizing repetition (default: 64, 0 = disabled, -1 = ctx-size).
   */
  repeatLastN?: number;

  /**
   * Penalize newline tokens when applying the repeat penalty (default: true).
   */
  penalizeNl?: boolean;

  /**
   * Repeat alpha presence penalty (default: 0.0, 0.0 = disabled).
   */
  presencePenalty?: number;

  /**
   * Repeat alpha frequency penalty (default: 0.0, 0.0 = disabled).
   */
  frequencyPenalty?: number;

  /**
   * This will replace the prompt for the purpose of the penalty evaluation.
   * Can be either null, a string or an array of numbers representing tokens
   * (default: null = use the original prompt).
   */
  penaltyPrompt?: string | number[];

  /**
   * Enable Mirostat sampling, controlling perplexity during text generation
   * (default: 0, 0 = disabled, 1 = Mirostat, 2 = Mirostat 2.0).
   */
  mirostat?: number;

  /**
   * Set the Mirostat target entropy, parameter tau (default: 5.0).
   */
  mirostatTau?: number;

  /**
   * Set the Mirostat learning rate, parameter eta (default: 0.1).
   */
  mirostatEta?: number;

  /**
   * Set grammar for grammar-based sampling (default: no grammar)
   *
   * @see https://github.com/ggerganov/llama.cpp/blob/master/grammars/README.md
   */
  grammar?: string;

  /**
   * Set the random number generator (RNG) seed
   * (default: -1, -1 = random seed).
   */
  seed?: number;

  /**
   * Ignore end of stream token and continue generating (default: false).
   */
  ignoreEos?: boolean;

  /**
   * Modify the likelihood of a token appearing in the generated text completion.
   * For example, use "logit_bias": [[15043,1.0]] to increase the likelihood of the token
   * 'Hello', or "logit_bias": [[15043,-1.0]] to decrease its likelihood.
   * Setting the value to false, "logit_bias": [[15043,false]] ensures that the token Hello is
   * never produced (default: []).
   */
  logitBias?: Array<[number, number | false]>;

  /**
   * If greater than 0, the response also contains the probabilities of top N tokens
   * for each generated token (default: 0)
   */
  nProbs?: number;

  /**
   * Save the prompt and generation for avoid reprocess entire prompt if a part of this isn't change (default: false)
   */
  cachePrompt?: boolean;

  /**
   * Assign the completion task to an specific slot.
   * If is -1 the task will be assigned to a Idle slot (default: -1)
   */
  slotId?: number;

  /**
   * Prompt template provider that is used when calling `.withTextPrompt()`, `withInstructionPrompt()` or `withChatPrompt()`.
   */
  promptTemplate?: TextGenerationPromptTemplateProvider<LlamaCppCompletionPrompt>;
}

export interface LlamaCppCompletionPrompt {
  /**
   * Text prompt. Images can be included through references such as `[img-ID]`, e.g. `[img-1]`.
   */
  text: string;

  /**
   * Maps image id to image base data.
   */
  images?: Record<number, string>;
}

export class LlamaCppCompletionModel<
    CONTEXT_WINDOW_SIZE extends number | undefined,
  >
  extends AbstractModel<LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>>
  implements
    TextStreamingModel<
      LlamaCppCompletionPrompt,
      LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>
    >
{
  constructor(
    settings: LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE> = {}
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
    prompt: LlamaCppCompletionPrompt,
    callOptions: FunctionCallOptions,
    options: {
      responseFormat: LlamaCppCompletionResponseFormatType<RESPONSE>;
    }
  ): Promise<RESPONSE> {
    const api = this.settings.api ?? new LlamaCppApiConfiguration();
    const responseFormat = options.responseFormat;
    const abortSignal = callOptions.run?.abortSignal;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl(`/completion`),
          headers: api.headers({
            functionType: callOptions.functionType,
            functionId: callOptions.functionId,
            run: callOptions.run,
            callId: callOptions.callId,
          }),
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
            temperature: this.settings.temperature,
            top_k: this.settings.topK,
            top_p: this.settings.topP,
            min_p: this.settings.minP,
            n_predict: this.settings.maxGenerationTokens,
            n_keep: this.settings.nKeep,
            stop: this.settings.stopSequences,
            tfs_z: this.settings.tfsZ,
            typical_p: this.settings.typicalP,
            repeat_penalty: this.settings.repeatPenalty,
            repeat_last_n: this.settings.repeatLastN,
            penalize_nl: this.settings.penalizeNl,
            presence_penalty: this.settings.presencePenalty,
            frequency_penalty: this.settings.frequencyPenalty,
            penalty_prompt: this.settings.penaltyPrompt,
            mirostat: this.settings.mirostat,
            mirostat_tau: this.settings.mirostatTau,
            mirostat_eta: this.settings.mirostatEta,
            grammar: this.settings.grammar,
            seed: this.settings.seed,
            ignore_eos: this.settings.ignoreEos,
            logit_bias: this.settings.logitBias,
            n_probs: this.settings.nProbs,
            cache_prompt: this.settings.cachePrompt,
            slot_id: this.settings.slotId,
          },
          failedResponseHandler: failedLlamaCppCallResponseHandler,
          successfulResponseHandler: responseFormat.handler,
          abortSignal,
        }),
    });
  }

  get settingsForEvent(): Partial<
    LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>
  > {
    const eventSettingProperties: Array<string> = [
      ...textGenerationModelProperties,

      "contextWindowSize",
      "temperature",
      "topK",
      "topP",
      "minP",
      "nKeep",
      "tfsZ",
      "typicalP",
      "repeatPenalty",
      "repeatLastN",
      "penalizeNl",
      "presencePenalty",
      "frequencyPenalty",
      "penaltyPrompt",
      "mirostat",
      "mirostatTau",
      "mirostatEta",
      "grammar",
      "seed",
      "ignoreEos",
      "logitBias",
      "nProbs",
      "cachePrompt",
      "slotId",
    ] satisfies (keyof LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  async countPromptTokens(prompt: LlamaCppCompletionPrompt): Promise<number> {
    const tokens = await this.tokenizer.tokenize(prompt.text);
    return tokens.length;
  }

  async doGenerateTexts(
    prompt: LlamaCppCompletionPrompt,
    options: FunctionCallOptions
  ) {
    return this.processTextGenerationResponse(
      await this.callAPI(prompt, options, {
        responseFormat: LlamaCppCompletionResponseFormat.json,
      })
    );
  }

  restoreGeneratedTexts(rawResponse: unknown) {
    return this.processTextGenerationResponse(
      validateTypes({
        structure: rawResponse,
        schema: zodSchema(llamaCppTextGenerationResponseSchema),
      })
    );
  }

  processTextGenerationResponse(rawResponse: LlamaCppTextGenerationResponse) {
    return {
      rawResponse,
      textGenerationResults: [
        {
          text: rawResponse.content,
          finishReason:
            rawResponse.stopped_eos || rawResponse.stopped_word
              ? ("stop" as const)
              : rawResponse.stopped_limit
                ? ("length" as const)
                : ("unknown" as const),
        },
      ],
      usage: {
        promptTokens: rawResponse.tokens_evaluated,
        completionTokens: rawResponse.tokens_predicted,
        totalTokens:
          rawResponse.tokens_evaluated + rawResponse.tokens_predicted,
      },
    };
  }

  doStreamText(prompt: LlamaCppCompletionPrompt, options: FunctionCallOptions) {
    return this.callAPI(prompt, options, {
      responseFormat: LlamaCppCompletionResponseFormat.deltaIterable,
    });
  }

  extractTextDelta(delta: unknown) {
    return (delta as LlamaCppTextStreamChunk).content;
  }

  asStructureGenerationModel<INPUT_PROMPT, LlamaCppPrompt>(
    promptTemplate:
      | StructureFromTextPromptTemplate<INPUT_PROMPT, LlamaCppPrompt>
      | FlexibleStructureFromTextPromptTemplate<INPUT_PROMPT, unknown>
  ) {
    return "adaptModel" in promptTemplate
      ? new StructureFromTextStreamingModel({
          model: promptTemplate.adaptModel(this),
          template: promptTemplate,
        })
      : new StructureFromTextStreamingModel({
          model: this as TextStreamingModel<LlamaCppPrompt>,
          template: promptTemplate,
        });
  }

  withJsonOutput(schema: Schema<unknown> & JsonSchemaProducer): this {
    // don't override the grammar if it's already set (to allow user to override)
    if (this.settings.grammar != null) {
      return this;
    }

    const grammar = convertJsonSchemaToGBNF(schema.getJsonSchema());

    return this.withSettings({
      grammar: grammar,
    });
  }

  private get promptTemplateProvider(): TextGenerationPromptTemplateProvider<LlamaCppCompletionPrompt> {
    return this.settings.promptTemplate ?? Text;
  }

  withTextPrompt(): PromptTemplateTextStreamingModel<
    string,
    LlamaCppCompletionPrompt,
    LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>,
    this
  > {
    return this.withPromptTemplate(this.promptTemplateProvider.text());
  }

  withInstructionPrompt(): PromptTemplateTextStreamingModel<
    InstructionPrompt,
    LlamaCppCompletionPrompt,
    LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>,
    this
  > {
    return this.withPromptTemplate(this.promptTemplateProvider.instruction());
  }

  withChatPrompt(): PromptTemplateTextStreamingModel<
    ChatPrompt,
    LlamaCppCompletionPrompt,
    LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>,
    this
  > {
    return this.withPromptTemplate(this.promptTemplateProvider.chat());
  }

  /**
   * Maps the prompt for the full Llama.cpp prompt template (incl. image support).
   */
  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<
      INPUT_PROMPT,
      LlamaCppCompletionPrompt
    >
  ): PromptTemplateTextStreamingModel<
    INPUT_PROMPT,
    LlamaCppCompletionPrompt,
    LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>,
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
      LlamaCppCompletionModelSettings<CONTEXT_WINDOW_SIZE>
    >
  ) {
    return new LlamaCppCompletionModel(
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
    temperature: z.number().optional(), // optional for backwards compatibility
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
    prompt_ms: z.number().nullable().optional(),
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

const llamaCppTextStreamChunkSchema = z.discriminatedUnion("stop", [
  z.object({
    content: z.string(),
    stop: z.literal(false),
  }),
  llamaCppTextGenerationResponseSchema,
]);

export type LlamaCppTextStreamChunk = z.infer<
  typeof llamaCppTextStreamChunkSchema
>;

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
            schema: zodSchema(llamaCppTextStreamChunkSchema),
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

export type LlamaCppCompletionResponseFormatType<T> = {
  stream: boolean;
  handler: ResponseHandler<T>;
};

export const LlamaCppCompletionResponseFormat = {
  /**
   * Returns the response as a JSON object.
   */
  json: {
    stream: false,
    handler: createJsonResponseHandler(
      zodSchema(llamaCppTextGenerationResponseSchema)
    ),
  } satisfies LlamaCppCompletionResponseFormatType<LlamaCppTextGenerationResponse>,

  /**
   * Returns an async iterable over the full deltas (all choices, including full current state at time of event)
   * of the response stream.
   */
  deltaIterable: {
    stream: true,
    handler: async ({ response }: { response: Response }) =>
      createLlamaCppFullDeltaIterableQueue(response.body!),
  } satisfies LlamaCppCompletionResponseFormatType<
    AsyncIterable<Delta<LlamaCppTextStreamChunk>>
  >,
};
