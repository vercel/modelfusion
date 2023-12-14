import { z } from "zod";
import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  ResponseHandler,
  createJsonResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi.js";
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
import { AsyncQueue } from "../../util/AsyncQueue.js";
import { parseEventSourceStream } from "../../util/streaming/parseEventSourceStream.js";
import { MistralApiConfiguration } from "./MistralApiConfiguration.js";
import { failedMistralCallResponseHandler } from "./MistralError.js";
import { chat, instruction, text } from "./MistralPromptTemplate.js";

export type MistralTextGenerationPrompt = Array<{
  role: "system" | "user" | "assistant";
  content: string;
}>;

export interface MistralTextGenerationModelSettings
  extends TextGenerationModelSettings {
  api?: ApiConfiguration;

  model: "mistral-tiny" | "mistral-small" | "mistral-medium";

  /**
   * What sampling temperature to use, between 0.0 and 2.0.
   * Higher values like 0.8 will make the output more random,
   * while lower values like 0.2 will make it more focused and deterministic.
   *
   * We generally recommend altering this or top_p but not both.
   *
   * Default: 0.7
   */
  temperature?: number | null;

  /**
   * Nucleus sampling, where the model considers the results of the tokens
   * with top_p probability mass. So 0.1 means only the tokens comprising
   * the top 10% probability mass are considered.
   *
   * We generally recommend altering this or temperature but not both.
   *
   * Default: 1
   */
  topP?: number;

  /**
   * Whether to inject a safety prompt before all conversations.
   *
   * Default: false
   */
  safeMode?: boolean;

  /**
   * The seed to use for random sampling. If set, different calls will
   * generate deterministic results.
   */
  randomSeed?: number | null;
}

export class MistralTextGenerationModel
  extends AbstractModel<MistralTextGenerationModelSettings>
  implements
    TextStreamingModel<
      MistralTextGenerationPrompt,
      MistralTextGenerationModelSettings
    >
{
  constructor(settings: MistralTextGenerationModelSettings) {
    super({ settings });
  }

  readonly provider = "mistral";
  get modelName() {
    return this.settings.model;
  }

  readonly contextWindowSize = undefined;
  readonly tokenizer = undefined;
  readonly countPromptTokens = undefined;

  async callAPI<RESULT>(
    prompt: MistralTextGenerationPrompt,
    options: {
      responseFormat: MistralTextGenerationResponseFormatType<RESULT>;
    } & FunctionOptions
  ) {
    const {
      model,
      temperature,
      topP,
      safeMode,
      randomSeed,
      maxCompletionTokens,
    } = this.settings;
    const api = this.settings.api ?? new MistralApiConfiguration();
    const abortSignal = options.run?.abortSignal;
    const stream = options.responseFormat.stream;
    const successfulResponseHandler = options.responseFormat.handler;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl(`/chat/completions`),
          headers: api.headers,
          body: {
            stream,
            messages: prompt,
            model,
            temperature,
            top_p: topP,
            max_tokens: maxCompletionTokens,
            safe_mode: safeMode,
            random_seed: randomSeed,
          },
          failedResponseHandler: failedMistralCallResponseHandler,
          successfulResponseHandler,
          abortSignal,
        }),
    });
  }

  get settingsForEvent(): Partial<MistralTextGenerationModelSettings> {
    const eventSettingProperties: Array<string> = [
      "maxCompletionTokens",
      "temperature",
      "topP",
      "safeMode",
      "randomSeed",
    ] satisfies (keyof MistralTextGenerationModelSettings)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  async doGenerateText(
    prompt: MistralTextGenerationPrompt,
    options?: FunctionOptions
  ) {
    const response = await this.callAPI(prompt, {
      ...options,
      responseFormat: MistralTextGenerationResponseFormat.json,
    });

    return {
      response,
      text: response.choices[0].message.content,
    };
  }

  doStreamText(prompt: MistralTextGenerationPrompt, options?: FunctionOptions) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: MistralTextGenerationResponseFormat.textDeltaIterable,
    });
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
    promptTemplate: TextGenerationPromptTemplate<
      INPUT_PROMPT,
      MistralTextGenerationPrompt
    >
  ): PromptTemplateTextStreamingModel<
    INPUT_PROMPT,
    MistralTextGenerationPrompt,
    MistralTextGenerationModelSettings,
    this
  > {
    return new PromptTemplateTextStreamingModel({
      model: this, // stop tokens are not supported by this model
      promptTemplate,
    });
  }

  withSettings(
    additionalSettings: Partial<MistralTextGenerationModelSettings>
  ) {
    return new MistralTextGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const mistralTextGenerationResponseSchema = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
      finish_reason: z.enum(["stop", "length", "model_length"]),
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

export type MistralTextGenerationResponse = z.infer<
  typeof mistralTextGenerationResponseSchema
>;

export type MistralTextGenerationResponseFormatType<T> = {
  stream: boolean;
  handler: ResponseHandler<T>;
};

export const MistralTextGenerationResponseFormat = {
  /**
   * Returns the response as a JSON object.
   */
  json: {
    stream: false,
    handler: createJsonResponseHandler(mistralTextGenerationResponseSchema),
  } satisfies MistralTextGenerationResponseFormatType<MistralTextGenerationResponse>,

  /**
   * Returns an async iterable over the text deltas (only the tex different of the first choice).
   */
  textDeltaIterable: {
    stream: true,
    handler: async ({ response }: { response: Response }) =>
      createMistralTextGenerationDeltaIterableQueue(
        response.body!,
        (delta) => delta[0]?.delta.content ?? ""
      ),
  } satisfies MistralTextGenerationResponseFormatType<
    AsyncIterable<Delta<string>>
  >,
};

export type MistralTextGenerationDelta = Array<{
  role: "assistant" | "user" | undefined;
  content: string;
  isComplete: boolean;
  delta: {
    role?: "assistant" | "user" | null;
    content?: string | null;
  };
}>;

const mistralTextGenerationChunkSchema = new ZodSchema(
  z.object({
    id: z.string(),
    object: z.string().optional(),
    created: z.number().optional(),
    model: z.string(),
    choices: z.array(
      z.object({
        index: z.number(),
        delta: z.object({
          role: z.enum(["assistant", "user"]).optional().nullable(),
          content: z.string().nullable().optional(),
        }),
        finish_reason: z
          .enum(["stop", "length", "model_length"])
          .nullable()
          .optional(),
      })
    ),
  })
);

async function createMistralTextGenerationDeltaIterableQueue<VALUE>(
  stream: ReadableStream<Uint8Array>,
  extractDeltaValue: (delta: MistralTextGenerationDelta) => VALUE
): Promise<AsyncIterable<Delta<VALUE>>> {
  const queue = new AsyncQueue<Delta<VALUE>>();
  const streamDelta: MistralTextGenerationDelta = [];

  // process the stream asynchonously (no 'await' on purpose):
  parseEventSourceStream({ stream })
    .then(async (events) => {
      try {
        for await (const event of events) {
          const data = event.data;

          if (data === "[DONE]") {
            queue.close();
            return;
          }

          const parseResult = safeParseJSON({
            text: data,
            schema: mistralTextGenerationChunkSchema,
          });

          if (!parseResult.success) {
            queue.push({
              type: "error",
              error: parseResult.error,
            });
            // Note: the queue is not closed on purpose. Some providers might add additional
            // chunks that are not parsable, and ModelFusion should be resilient to that.
            continue;
          }

          const completionChunk = parseResult.data;

          for (let i = 0; i < completionChunk.choices.length; i++) {
            const eventChoice = completionChunk.choices[i];
            const delta = eventChoice.delta;

            if (streamDelta[i] == null) {
              streamDelta[i] = {
                role: undefined,
                content: "",
                isComplete: false,
                delta,
              };
            }

            const choice = streamDelta[i];

            choice.delta = delta;

            if (eventChoice.finish_reason != null) {
              choice.isComplete = true;
            }

            if (delta.content != undefined) {
              choice.content += delta.content;
            }

            if (delta.role != undefined) {
              choice.role = delta.role;
            }
          }

          // Since we're mutating the choices array in an async scenario,
          // we need to make a deep copy:
          const streamDeltaDeepCopy: MistralTextGenerationDelta = JSON.parse(
            JSON.stringify(streamDelta)
          );

          queue.push({
            type: "delta",
            fullDelta: streamDeltaDeepCopy,
            valueDelta: extractDeltaValue(streamDeltaDeepCopy),
          });
        }
      } catch (error) {
        queue.push({ type: "error", error });
        queue.close();
        return;
      }
    })
    .catch((error) => {
      queue.push({ type: "error", error });
      queue.close();
      return;
    });

  return queue;
}
