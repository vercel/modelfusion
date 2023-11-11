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
import {
  mapChatPromptToTextFormat,
  mapInstructionPromptToTextFormat,
} from "../../model-function/generate-text/prompt-format/TextPromptFormat.js";
import { countTokens } from "../../model-function/tokenize-text/countTokens.js";
import { AsyncQueue } from "../../util/AsyncQueue.js";
import { parseJsonStream } from "../../util/streaming/parseJsonStream.js";
import { CohereApiConfiguration } from "./CohereApiConfiguration.js";
import { failedCohereCallResponseHandler } from "./CohereError.js";
import { CohereTokenizer } from "./CohereTokenizer.js";

export const COHERE_TEXT_GENERATION_MODELS = {
  command: {
    contextWindowSize: 2048,
  },
  "command-nightly": {
    contextWindowSize: 2048,
  },
  "command-light": {
    contextWindowSize: 2048,
  },
  "command-light-nightly": {
    contextWindowSize: 2048,
  },
};

export type CohereTextGenerationModelType =
  keyof typeof COHERE_TEXT_GENERATION_MODELS;

export interface CohereTextGenerationModelSettings
  extends TextGenerationModelSettings {
  api?: ApiConfiguration;

  model: CohereTextGenerationModelType;

  numGenerations?: number;
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
 *   model: "command-nightly",
 *   temperature: 0.7,
 *   maxCompletionTokens: 500,
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
    options: {
      responseFormat: CohereTextGenerationResponseFormatType<RESPONSE>;
    } & FunctionOptions
  ): Promise<RESPONSE> {
    return callWithRetryAndThrottle({
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () =>
        callCohereTextGenerationAPI({
          ...this.settings,

          // use endSequences instead of stopSequences
          // to exclude stop tokens from the generated text
          endSequences: this.settings.stopSequences,
          maxTokens: this.settings.maxCompletionTokens,

          // mapped name because of conflict with stopSequences:
          stopSequences: this.settings.cohereStopSequences,

          abortSignal: options.run?.abortSignal,
          responseFormat: options.responseFormat,
          prompt,
        }),
    });
  }

  get settingsForEvent(): Partial<CohereTextGenerationModelSettings> {
    const eventSettingProperties: Array<string> = [
      "maxCompletionTokens",
      "stopSequences",

      "numGenerations",
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

  async doGenerateText(prompt: string, options?: FunctionOptions) {
    const response = await this.callAPI(prompt, {
      ...options,
      responseFormat: CohereTextGenerationResponseFormat.json,
    });

    return {
      response,
      text: response.generations[0].text,
    };
  }

  doStreamText(prompt: string, options?: FunctionOptions) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: CohereTextGenerationResponseFormat.deltaIterable,
    });
  }

  extractTextDelta(fullDelta: CohereTextGenerationDelta): string | undefined {
    return fullDelta.delta;
  }

  /**
   * Returns this model with an instruction prompt format.
   */
  withInstructionPrompt() {
    return this.withPromptFormat(mapInstructionPromptToTextFormat());
  }

  /**
   * Returns this model with a chat prompt format.
   */
  withChatPrompt(options?: { user?: string; ai?: string }) {
    return this.withPromptFormat(mapChatPromptToTextFormat(options));
  }

  withPromptFormat<INPUT_PROMPT>(
    promptFormat: TextGenerationPromptFormat<INPUT_PROMPT, string>
  ): PromptFormatTextStreamingModel<
    INPUT_PROMPT,
    string,
    CohereTextGenerationModelSettings,
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

async function callCohereTextGenerationAPI<RESPONSE>({
  api = new CohereApiConfiguration(),
  abortSignal,
  responseFormat,
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
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  responseFormat: CohereTextGenerationResponseFormatType<RESPONSE>;
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
    url: api.assembleUrl(`/generate`),
    headers: api.headers,
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
): Promise<AsyncIterable<Delta<string>>> {
  const queue = new AsyncQueue<Delta<string>>();

  let accumulatedText = "";

  // process the stream asynchonously (no 'await' on purpose):
  parseJsonStream({
    stream,
    schema: cohereTextStreamingResponseSchema,
    process(event) {
      if (event.is_finished === true) {
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
        accumulatedText += event.text;

        queue.push({
          type: "delta",
          fullDelta: {
            content: accumulatedText,
            isComplete: false,
            delta: event.text,
          },
          valueDelta: event.text,
        });
      }
    },
    onDone() {
      queue.close();
    },
  });

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
    AsyncIterable<Delta<string>>
  >,
};
