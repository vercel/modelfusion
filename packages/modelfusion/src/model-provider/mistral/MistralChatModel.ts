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
import { TextGenerationFinishReason } from "../../model-function/generate-text/TextGenerationResult.js";
import { AsyncQueue } from "../../util/AsyncQueue.js";
import { parseEventSourceStream } from "../../util/streaming/parseEventSourceStream.js";
import { MistralApiConfiguration } from "./MistralApiConfiguration.js";
import { failedMistralCallResponseHandler } from "./MistralError.js";
import { chat, instruction, text } from "./MistralPromptTemplate.js";

export type MistralChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type MistralChatPrompt = Array<MistralChatMessage>;

export interface MistralChatModelSettings extends TextGenerationModelSettings {
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

export class MistralChatModel
  extends AbstractModel<MistralChatModelSettings>
  implements TextStreamingModel<MistralChatPrompt, MistralChatModelSettings>
{
  constructor(settings: MistralChatModelSettings) {
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
    prompt: MistralChatPrompt,
    options: {
      responseFormat: MistralChatResponseFormatType<RESULT>;
    } & FunctionOptions
  ) {
    const {
      model,
      temperature,
      topP,
      safeMode,
      randomSeed,
      maxGenerationTokens,
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
            max_tokens: maxGenerationTokens,
            safe_mode: safeMode,
            random_seed: randomSeed,
          },
          failedResponseHandler: failedMistralCallResponseHandler,
          successfulResponseHandler,
          abortSignal,
        }),
    });
  }

  get settingsForEvent(): Partial<MistralChatModelSettings> {
    const eventSettingProperties: Array<string> = [
      "maxGenerationTokens",
      "stopSequences",
      "numberOfGenerations",
      "trimWhitespace",

      "temperature",
      "topP",
      "safeMode",
      "randomSeed",
    ] satisfies (keyof MistralChatModelSettings)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  async doGenerateTexts(prompt: MistralChatPrompt, options?: FunctionOptions) {
    const response = await this.callAPI(prompt, {
      ...options,
      responseFormat: MistralChatResponseFormat.json,
    });

    return {
      response,
      textGenerationResults: response.choices.map((choice) => ({
        text: choice.message.content,
        finishReason: this.translateFinishReason(choice.finish_reason),
      })),
    };
  }

  private translateFinishReason(
    finishReason: string | null | undefined
  ): TextGenerationFinishReason {
    switch (finishReason) {
      case "stop":
        return "stop";
      case "length":
      case "model_length":
        return "length";
      default:
        return "unknown";
    }
  }

  doStreamText(prompt: MistralChatPrompt, options?: FunctionOptions) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: MistralChatResponseFormat.textDeltaIterable,
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
      MistralChatPrompt
    >
  ): PromptTemplateTextStreamingModel<
    INPUT_PROMPT,
    MistralChatPrompt,
    MistralChatModelSettings,
    this
  > {
    return new PromptTemplateTextStreamingModel({
      model: this, // stop tokens are not supported by this model
      promptTemplate,
    });
  }

  withSettings(additionalSettings: Partial<MistralChatModelSettings>) {
    return new MistralChatModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const mistralChatResponseSchema = z.object({
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

export type MistralChatResponse = z.infer<typeof mistralChatResponseSchema>;

export type MistralChatResponseFormatType<T> = {
  stream: boolean;
  handler: ResponseHandler<T>;
};

export const MistralChatResponseFormat = {
  /**
   * Returns the response as a JSON object.
   */
  json: {
    stream: false,
    handler: createJsonResponseHandler(mistralChatResponseSchema),
  } satisfies MistralChatResponseFormatType<MistralChatResponse>,

  /**
   * Returns an async iterable over the text deltas (only the tex different of the first choice).
   */
  textDeltaIterable: {
    stream: true,
    handler: async ({ response }: { response: Response }) =>
      createMistralChatDeltaIterableQueue(
        response.body!,
        (delta) => delta[0]?.delta.content ?? ""
      ),
  } satisfies MistralChatResponseFormatType<AsyncIterable<Delta<string>>>,
};

export type MistralChatDelta = Array<{
  role: "assistant" | "user" | undefined;
  content: string;
  isComplete: boolean;
  delta: {
    role?: "assistant" | "user" | null;
    content?: string | null;
  };
}>;

const mistralChatChunkSchema = new ZodSchema(
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

async function createMistralChatDeltaIterableQueue<VALUE>(
  stream: ReadableStream<Uint8Array>,
  extractDeltaValue: (delta: MistralChatDelta) => VALUE
): Promise<AsyncIterable<Delta<VALUE>>> {
  const queue = new AsyncQueue<Delta<VALUE>>();
  const streamDelta: MistralChatDelta = [];

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
            schema: mistralChatChunkSchema,
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
          const streamDeltaDeepCopy: MistralChatDelta = JSON.parse(
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
