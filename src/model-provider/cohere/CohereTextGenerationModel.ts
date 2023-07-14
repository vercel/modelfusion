import SecureJSON from "secure-json-parse";
import { z } from "zod";
import { AbstractModel } from "../../model/AbstractModel.js";
import { FunctionOptions } from "../../model/FunctionOptions.js";
import {
  TextGenerationModelSettings,
  TextGenerationModelWithTokenization,
} from "../../model/text-generation/TextGenerationModel.js";
import { AsyncQueue } from "../../model/text-streaming/AsyncQueue.js";
import { DeltaEvent } from "../../model/text-streaming/DeltaEvent.js";
import {
  TextStreamingModel,
  TextStreamingModelSettings,
} from "../../model/text-streaming/TextStreamingModel.js";
import { FullTokenizer } from "../../model/tokenize-text/Tokenizer.js";
import { countTokens } from "../../model/tokenize-text/countTokens.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  ResponseHandler,
  createJsonResponseHandler,
  postJsonToApi,
} from "../../util/api/postToApi.js";
import { failedCohereCallResponseHandler } from "./CohereError.js";
import { CohereTokenizer } from "./CohereTokenizer.js";

export const COHERE_TEXT_GENERATION_MODELS = {
  command: {
    maxTokens: 2048,
  },
  "command-nightly": {
    maxTokens: 2048,
  },
  "command-light": {
    maxTokens: 2048,
  },
  "command-light-nightly": {
    maxTokens: 2048,
  },
};

export type CohereTextGenerationModelType =
  keyof typeof COHERE_TEXT_GENERATION_MODELS;

export interface CohereTextGenerationModelSettings
  extends TextGenerationModelSettings,
    TextStreamingModelSettings {
  model: CohereTextGenerationModelType;

  baseUrl?: string;
  apiKey?: string;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;

  tokenizerSettings?: {
    retry?: RetryFunction;
    throttle?: ThrottleFunction;
  };

  numGenerations?: number;
  maxTokens?: number;
  temperature?: number;
  k?: number;
  p?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  endSequences?: string[];
  stopSequences?: string[];
  returnLikelihoods?: "GENERATION" | "ALL" | "NONE";
  logitBias?: Record<string, number>;
  truncate?: "NONE" | "START" | "END";
}

/**
 * Create a text generation model that calls the Cohere Co.Generate API.
 *
 * @see https://docs.cohere.com/reference/generate
 *
 * @example
 * const textGenerationModel = new CohereTextGenerationModel({
 *   model: "command-nightly",
 *   temperature: 0.7,
 *   maxTokens: 500,
 * });
 *
 * const text = await textGenerationModel.generateText(
 *   "Write a short story about a robot learning to love:\n\n"
 * );
 */
export class CohereTextGenerationModel
  extends AbstractModel<CohereTextGenerationModelSettings>
  implements
    TextGenerationModelWithTokenization<
      string,
      CohereTextGenerationResponse,
      CohereTextGenerationModelSettings
    >,
    FullTokenizer,
    TextStreamingModel<
      string,
      CohereTextGenerationDelta,
      CohereTextGenerationModelSettings
    >
{
  constructor(settings: CohereTextGenerationModelSettings) {
    super({ settings });

    this.maxTokens =
      COHERE_TEXT_GENERATION_MODELS[this.settings.model].maxTokens;

    this.tokenizer = new CohereTokenizer({
      baseUrl: this.settings.baseUrl,
      apiKey: this.settings.apiKey,
      model: this.settings.model,
      retry: this.settings.tokenizerSettings?.retry,
      throttle: this.settings.tokenizerSettings?.throttle,
    });
  }

  readonly provider = "cohere" as const;
  get modelName() {
    return this.settings.model;
  }

  readonly maxTokens: number;

  private readonly tokenizer: CohereTokenizer;

  async tokenize(text: string) {
    return this.tokenizer.tokenize(text);
  }

  async tokenizeWithTexts(text: string) {
    return this.tokenizer.tokenizeWithTexts(text);
  }

  async detokenize(tokens: number[]) {
    return this.tokenizer.detokenize(tokens);
  }

  private get apiKey() {
    const apiKey = this.settings.apiKey ?? process.env.COHERE_API_KEY;

    if (apiKey == null) {
      throw new Error(
        "No Cohere API key provided. Pass an API key to the constructor or set the COHERE_API_KEY environment variable."
      );
    }

    return apiKey;
  }

  async countPromptTokens(input: string) {
    return countTokens(this.tokenizer, input);
  }

  async callAPI<RESPONSE>(
    prompt: string,
    options: {
      responseFormat: CohereTextGenerationResponseFormatType<RESPONSE>;
    } & FunctionOptions<CohereTextGenerationModelSettings>
  ): Promise<RESPONSE> {
    const { run, settings, responseFormat } = options;

    const callSettings = Object.assign(
      {
        apiKey: this.apiKey,
      },
      this.settings,
      settings,
      {
        abortSignal: run?.abortSignal,
        prompt,
        responseFormat,
      }
    );

    return callWithRetryAndThrottle({
      retry: this.settings.retry,
      throttle: this.settings.throttle,
      call: async () => callCohereTextGenerationAPI(callSettings),
    });
  }

  generateTextResponse(
    prompt: string,
    options?: FunctionOptions<CohereTextGenerationModelSettings>
  ) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: CohereTextGenerationResponseFormat.json,
    });
  }

  extractText(response: CohereTextGenerationResponse): string {
    return response.generations[0].text;
  }

  generateDeltaStreamResponse(
    prompt: string,
    options?: FunctionOptions<CohereTextGenerationModelSettings>
  ) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: CohereTextGenerationResponseFormat.deltaIterable,
    });
  }

  extractTextDelta(fullDelta: CohereTextGenerationDelta): string | undefined {
    return fullDelta.delta;
  }

  withSettings(additionalSettings: Partial<CohereTextGenerationModelSettings>) {
    return new CohereTextGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }

  withMaxTokens(maxTokens: number) {
    return this.withSettings({ maxTokens });
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

/**
 * Call the Cohere Co.Generate API to generate a text completion for the given prompt.
 *
 * @see https://docs.cohere.com/reference/generate
 *
 * @example
 * const response = await callCohereTextGenerationAPI({
 *   apiKey: COHERE_API_KEY,
 *   model: "command-nightly",
 *   prompt: "Write a short story about a robot learning to love:\n\n",
 *   temperature: 0.7,
 *   maxTokens: 500,
 * });
 *
 * console.log(response.generations[0].text);
 */
async function callCohereTextGenerationAPI<RESPONSE>({
  baseUrl = "https://api.cohere.ai/v1",
  abortSignal,
  responseFormat,
  apiKey,
  model,
  prompt,
  numGenerations,
  maxTokens,
  temperature,
  k,
  p,
  frequencyPenalty,
  presencePenalty,
  endSequences,
  stopSequences,
  returnLikelihoods,
  logitBias,
  truncate,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  responseFormat: CohereTextGenerationResponseFormatType<RESPONSE>;
  apiKey: string;
  model: CohereTextGenerationModelType;
  prompt: string;
  numGenerations?: number;
  maxTokens?: number;
  temperature?: number;
  k?: number;
  p?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  endSequences?: string[];
  stopSequences?: string[];
  returnLikelihoods?: "GENERATION" | "ALL" | "NONE";
  logitBias?: Record<string, number>;
  truncate?: "NONE" | "START" | "END";
}): Promise<RESPONSE> {
  return postJsonToApi({
    url: `${baseUrl}/generate`,
    apiKey,
    body: {
      stream: responseFormat.stream,
      model,
      prompt,
      num_generations: numGenerations,
      max_tokens: maxTokens,
      temperature,
      k,
      p,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      end_sequences: endSequences,
      stop_sequences: stopSequences,
      return_likelihoods: returnLikelihoods,
      logit_bias: logitBias,
      truncate,
    },
    failedResponseHandler: failedCohereCallResponseHandler,
    successfulResponseHandler: responseFormat.handler,
    abortSignal,
  });
}

export type CohereTextGenerationDelta = {
  content: string;
  isComplete: boolean;
  delta: string;
};

const cohereTextStreamingResponseSchema = z.discriminatedUnion("is_finished", [
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

async function createCohereTextGenerationFullDeltaIterableQueue(
  stream: ReadableStream<Uint8Array>
): Promise<AsyncIterable<DeltaEvent<CohereTextGenerationDelta>>> {
  const queue = new AsyncQueue<DeltaEvent<CohereTextGenerationDelta>>();

  let accumulatedText = "";

  function processLine(line: string) {
    const event = cohereTextStreamingResponseSchema.parse(
      SecureJSON.parse(line)
    );

    if (event.is_finished === true) {
      queue.push({
        type: "delta",
        fullDelta: {
          content: accumulatedText,
          isComplete: true,
          delta: "",
        },
      });
    } else {
      accumulatedText += event.text;

      queue.push({
        type: "delta",
        fullDelta: {
          content: accumulatedText,
          isComplete: false,
          delta: event.text,
        },
      });
    }
  }

  // process the stream asynchonously (no 'await' on purpose):
  (async () => {
    let unprocessedText = "";
    const reader = new ReadableStreamDefaultReader(stream);
    const utf8Decoder = new TextDecoder("utf-8");
    while (true) {
      const { value: chunk, done } = await reader.read();

      if (done) {
        break;
      }

      unprocessedText += utf8Decoder.decode(chunk, { stream: true });

      const processableLines = unprocessedText.split(/\r\n|\n|\r/g);

      unprocessedText = processableLines.pop() || "";

      processableLines.forEach(processLine);
    }

    // processing remaining text:
    if (unprocessedText) {
      processLine(unprocessedText);
    }

    queue.close();
  })();

  return queue;
}

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
    handler: createJsonResponseHandler(cohereTextGenerationResponseSchema),
  } satisfies CohereTextGenerationResponseFormatType<CohereTextGenerationResponse>,

  /**
   * Returns an async iterable over the full deltas (all choices, including full current state at time of event)
   * of the response stream.
   */
  deltaIterable: {
    stream: true,
    handler: async ({ response }: { response: Response }) =>
      createCohereTextGenerationFullDeltaIterableQueue(response.body!),
  } satisfies CohereTextGenerationResponseFormatType<
    AsyncIterable<DeltaEvent<CohereTextGenerationDelta>>
  >,
};
