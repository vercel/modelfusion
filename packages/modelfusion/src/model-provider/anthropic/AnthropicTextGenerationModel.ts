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
import { TextGenerationFinishReason } from "../../model-function/generate-text/TextGenerationResult.js";
import { AsyncQueue } from "../../util/AsyncQueue.js";
import { parseEventSourceStream } from "../../util/streaming/parseEventSourceStream.js";
import { AnthropicApiConfiguration } from "./AnthropicApiConfiguration.js";
import { failedAnthropicCallResponseHandler } from "./AnthropicError.js";
import { chat, instruction, text } from "./AnthropicPromptTemplate.js";

export const ANTHROPIC_TEXT_GENERATION_MODELS = {
  "claude-instant-1": {
    contextWindowSize: 100_000,
  },
  "claude-instant-1.2": {
    contextWindowSize: 100_000,
  },
  "claude-2": {
    contextWindowSize: 200_000,
  },
  "claude-2.0": {
    contextWindowSize: 100_000,
  },
  "claude-2.1": {
    contextWindowSize: 200_000,
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
    const api = this.settings.api ?? new AnthropicApiConfiguration();
    const responseFormat = options.responseFormat;
    const abortSignal = options.run?.abortSignal;
    const userId = this.settings.userId;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () => {
        return postJsonToApi({
          url: api.assembleUrl(`/complete`),
          headers: api.headers,
          body: {
            model: this.settings.model,
            prompt,
            stream: responseFormat.stream,
            max_tokens_to_sample: this.settings.maxGenerationTokens ?? 100,
            temperature: this.settings.temperature,
            top_k: this.settings.topK,
            top_p: this.settings.topP,
            stop_sequences: this.settings.stopSequences,
            metadata: userId != null ? { user_id: userId } : undefined,
          },
          failedResponseHandler: failedAnthropicCallResponseHandler,
          successfulResponseHandler: responseFormat.handler,
          abortSignal,
        });
      },
    });
  }

  get settingsForEvent(): Partial<AnthropicTextGenerationModelSettings> {
    const eventSettingProperties: Array<string> = [
      ...textGenerationModelProperties,

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

  async doGenerateTexts(prompt: string, options?: FunctionOptions) {
    const response = await this.callAPI(prompt, {
      ...options,
      responseFormat: AnthropicTextGenerationResponseFormat.json,
    });

    return {
      response,
      textGenerationResults: [
        {
          text: response.completion,
          finishReason: this.translateFinishReason(response.stop_reason),
        },
      ],
    };
  }

  private translateFinishReason(
    finishReason: string | null | undefined
  ): TextGenerationFinishReason {
    switch (finishReason) {
      case "stop_sequence":
        return "stop";
      case "max_tokens":
        return "length";
      default:
        return "unknown";
    }
  }

  doStreamText(prompt: string, options?: FunctionOptions) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: AnthropicTextGenerationResponseFormat.deltaIterable,
    });
  }

  extractTextDelta(delta: unknown) {
    const chunk = delta as AnthropicTextStreamChunk;
    return chunk.completion;
  }

  /**
   * Returns this model with a text prompt template.
   */
  withTextPrompt() {
    return this.withPromptTemplate(text());
  }

  /**
   * Returns this model with an instruction prompt template.
   */
  withInstructionPrompt() {
    return this.withPromptTemplate(instruction());
  }

  /**
   * Returns this model with a chat prompt template.
   */
  withChatPrompt() {
    return this.withPromptTemplate(chat());
  }

  withPromptTemplate<INPUT_PROMPT>(
    promptTemplate: TextGenerationPromptTemplate<INPUT_PROMPT, string>
  ): PromptTemplateTextStreamingModel<
    INPUT_PROMPT,
    string,
    AnthropicTextGenerationModelSettings,
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

const anthropicTextStreamChunkSchema = z.object({
  completion: z.string(),
  stop_reason: z.string().nullable(),
  model: z.string(),
});

type AnthropicTextStreamChunk = z.infer<typeof anthropicTextStreamChunkSchema>;

async function createAnthropicFullDeltaIterableQueue(
  stream: ReadableStream<Uint8Array>
): Promise<AsyncIterable<Delta<AnthropicTextStreamChunk>>> {
  const queue = new AsyncQueue<Delta<AnthropicTextStreamChunk>>();

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

          const eventData = parseJSON({
            text: data,
            schema: zodSchema(anthropicTextStreamChunkSchema),
          });

          queue.push({ type: "delta", deltaValue: eventData });

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
    handler: createJsonResponseHandler(
      zodSchema(anthropicTextGenerationResponseSchema)
    ),
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
    AsyncIterable<Delta<AnthropicTextStreamChunk>>
  >,
};
