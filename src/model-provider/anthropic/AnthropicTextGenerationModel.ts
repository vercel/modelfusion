import SecureJSON from "secure-json-parse";
import { z } from "zod";
import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  ResponseHandler,
  createJsonResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi.js";
import { AsyncQueue } from "../../event-source/AsyncQueue.js";
import { parseEventSourceStream } from "../../event-source/parseEventSourceStream.js";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { Delta } from "../../model-function/Delta.js";
import { PromptFormatTextStreamingModel } from "../../model-function/generate-text/PromptFormatTextStreamingModel.js";
import {
  TextGenerationModelSettings,
  TextStreamingModel,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { TextGenerationPromptFormat } from "../../model-function/generate-text/TextGenerationPromptFormat.js";
import { AnthropicApiConfiguration } from "./AnthropicApiConfiguration.js";
import { failedAnthropicCallResponseHandler } from "./AnthropicError.js";
import {
  mapChatPromptToAnthropicFormat,
  mapInstructionPromptToAnthropicFormat,
} from "./AnthropicPromptFormat.js";

export const ANTHROPIC_TEXT_GENERATION_MODELS = {
  "claude-instant-1": {
    contextWindowSize: 100_000,
  },
  "claude-instant-1.2": {
    contextWindowSize: 100_000,
  },
  "claude-2": {
    contextWindowSize: 100_000,
  },
  "claude-2.0": {
    contextWindowSize: 100_000,
  },
};

export type AnthropicTextGenerationModelType =
  keyof typeof ANTHROPIC_TEXT_GENERATION_MODELS;

export interface AnthropicTextGenerationModelSettings
  extends TextGenerationModelSettings {
  api?: ApiConfiguration;

  model: AnthropicTextGenerationModelType;

  temperature?: number;
  topP?: number;
  topK?: number;
  userId?: number;
}

/**
 * Create a text generation model that calls the Anthropic API.
 *
 * @see https://docs.anthropic.com/claude/reference/complete_post
 */
export class AnthropicTextGenerationModel
  extends AbstractModel<AnthropicTextGenerationModelSettings>
  implements TextStreamingModel<string, AnthropicTextGenerationModelSettings>
{
  constructor(settings: AnthropicTextGenerationModelSettings) {
    super({ settings });

    this.contextWindowSize =
      ANTHROPIC_TEXT_GENERATION_MODELS[this.settings.model].contextWindowSize;
  }

  readonly provider = "anthropic" as const;
  get modelName() {
    return this.settings.model;
  }

  readonly contextWindowSize: number;
  readonly tokenizer = undefined;
  readonly countPromptTokens = undefined;

  async callAPI<RESPONSE>(
    prompt: string,
    options: {
      responseFormat: AnthropicTextGenerationResponseFormatType<RESPONSE>;
    } & FunctionOptions
  ): Promise<RESPONSE> {
    return callWithRetryAndThrottle({
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () =>
        callAnthropicTextGenerationAPI({
          ...this.settings,

          stopSequences: this.settings.stopSequences,
          maxTokens: this.settings.maxCompletionTokens,

          abortSignal: options.run?.abortSignal,
          responseFormat: options.responseFormat,
          prompt,
        }),
    });
  }

  get settingsForEvent(): Partial<AnthropicTextGenerationModelSettings> {
    const eventSettingProperties: Array<string> = [
      "maxCompletionTokens",
      "stopSequences",

      "temperature",
      "topK",
      "topP",
      "userId",
    ] satisfies (keyof AnthropicTextGenerationModelSettings)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  async doGenerateText(prompt: string, options?: FunctionOptions) {
    const response = await this.callAPI(prompt, {
      ...options,
      responseFormat: AnthropicTextGenerationResponseFormat.json,
    });

    return {
      response,
      text: response.completion,
    };
  }

  doStreamText(prompt: string, options?: FunctionOptions) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: AnthropicTextGenerationResponseFormat.deltaIterable,
    });
  }

  /**
   * Returns this model with an instruction prompt format.
   */
  withInstructionPrompt() {
    return this.withPromptFormat(mapInstructionPromptToAnthropicFormat());
  }

  /**
   * Returns this model with a chat prompt format.
   */
  withChatPrompt() {
    return this.withPromptFormat(mapChatPromptToAnthropicFormat());
  }

  withPromptFormat<INPUT_PROMPT>(
    promptFormat: TextGenerationPromptFormat<INPUT_PROMPT, string>
  ): PromptFormatTextStreamingModel<
    INPUT_PROMPT,
    string,
    AnthropicTextGenerationModelSettings,
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
    additionalSettings: Partial<AnthropicTextGenerationModelSettings>
  ) {
    return new AnthropicTextGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const anthropicTextGenerationResponseSchema = z.object({
  completion: z.string(),
  stop_reason: z.string(),
  model: z.string(),
});

export type AnthropicTextGenerationResponse = z.infer<
  typeof anthropicTextGenerationResponseSchema
>;

async function callAnthropicTextGenerationAPI<RESPONSE>({
  api = new AnthropicApiConfiguration(),
  abortSignal,
  responseFormat,
  model,
  prompt,
  maxTokens,
  stopSequences,
  temperature,
  topK,
  topP,
  userId,
}: {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  responseFormat: AnthropicTextGenerationResponseFormatType<RESPONSE>;
  model: AnthropicTextGenerationModelType;
  prompt: string;
  maxTokens?: number;
  stopSequences?: string[];
  temperature?: number;
  topP?: number;
  topK?: number;
  userId?: number;
}): Promise<RESPONSE> {
  return postJsonToApi({
    url: api.assembleUrl(`/complete`),
    headers: api.headers,
    body: {
      model,
      prompt,
      stream: responseFormat.stream,
      max_tokens_to_sample: maxTokens,
      temperature,
      top_k: topK,
      top_p: topP,
      stop_sequences: stopSequences,
      metadata: userId != null ? { user_id: userId } : undefined,
    },
    failedResponseHandler: failedAnthropicCallResponseHandler,
    successfulResponseHandler: responseFormat.handler,
    abortSignal,
  });
}

const anthropicTextStreamingResponseSchema = z.object({
  completion: z.string(),
  stop_reason: z.string().nullable(),
  model: z.string(),
});

async function createAnthropicFullDeltaIterableQueue(
  stream: ReadableStream<Uint8Array>
): Promise<AsyncIterable<Delta<string>>> {
  const queue = new AsyncQueue<Delta<string>>();

  let content = "";

  // process the stream asynchonously (no 'await' on purpose):
  parseEventSourceStream({ stream })
    .then(async (events) => {
      try {
        for await (const event of events) {
          if (event.event === "error") {
            queue.push({ type: "error", error: event.data });
            queue.close();
            return;
          }

          if (event.event !== "completion") {
            continue;
          }

          const data = event.data;

          const json = SecureJSON.parse(data);
          const parseResult =
            anthropicTextStreamingResponseSchema.safeParse(json);

          if (!parseResult.success) {
            queue.push({
              type: "error",
              error: parseResult.error,
            });
            queue.close();
            return;
          }

          const eventData = parseResult.data;

          content += eventData.completion;

          queue.push({
            type: "delta",
            fullDelta: {
              content,
              isComplete: eventData.stop_reason != null,
              delta: eventData.completion,
            },
            valueDelta: eventData.completion,
          });

          if (eventData.stop_reason != null) {
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

export type AnthropicTextGenerationResponseFormatType<T> = {
  stream: boolean;
  handler: ResponseHandler<T>;
};

export const AnthropicTextGenerationResponseFormat = {
  /**
   * Returns the response as a JSON object.
   */
  json: {
    stream: false,
    handler: createJsonResponseHandler(anthropicTextGenerationResponseSchema),
  } satisfies AnthropicTextGenerationResponseFormatType<AnthropicTextGenerationResponse>,

  /**
   * Returns an async iterable over the full deltas (all choices, including full current state at time of event)
   * of the response stream.
   */
  deltaIterable: {
    stream: true,
    handler: async ({ response }: { response: Response }) =>
      createAnthropicFullDeltaIterableQueue(response.body!),
  } satisfies AnthropicTextGenerationResponseFormatType<
    AsyncIterable<Delta<string>>
  >,
};
