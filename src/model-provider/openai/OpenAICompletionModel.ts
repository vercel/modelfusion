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
} from "../../model-function/generate-text/TextPromptFormat.js";
import { countTokens } from "../../model-function/tokenize-text/countTokens.js";
import { AsyncQueue } from "../../util/AsyncQueue.js";
import { parseJsonWithZod } from "../../util/parseJSON.js";
import { parseEventSourceStream } from "../../util/streaming/parseEventSourceStream.js";
import { OpenAIApiConfiguration } from "./OpenAIApiConfiguration.js";
import { failedOpenAICallResponseHandler } from "./OpenAIError.js";
import { TikTokenTokenizer } from "./TikTokenTokenizer.js";

/**
 * @see https://platform.openai.com/docs/models/
 * @see https://openai.com/pricing
 */
export const OPENAI_TEXT_GENERATION_MODELS = {
  "gpt-3.5-turbo-instruct": {
    contextWindowSize: 4097,
    promptTokenCostInMillicents: 0.15,
    completionTokenCostInMillicents: 0.2,
  },
  "davinci-002": {
    contextWindowSize: 16_384,
    promptTokenCostInMillicents: 0.2,
    completionTokenCostInMillicents: 0.2,
    fineTunedTokenCostInMillicents: 1.2,
  },
  "babbage-002": {
    contextWindowSize: 16_384,
    promptTokenCostInMillicents: 0.04,
    completionTokenCostInMillicents: 0.04,
    fineTunedTokenCostInMillicents: 0.16,
  },
  "text-davinci-003": {
    contextWindowSize: 4096,
    promptTokenCostInMillicents: 2,
    completionTokenCostInMillicents: 2,
  },
  "text-davinci-002": {
    contextWindowSize: 4096,
    promptTokenCostInMillicents: 2,
    completionTokenCostInMillicents: 2,
  },
  "code-davinci-002": {
    contextWindowSize: 8000,
    promptTokenCostInMillicents: 2,
    completionTokenCostInMillicents: 2,
  },
  davinci: {
    contextWindowSize: 2048,
    promptTokenCostInMillicents: 2,
    completionTokenCostInMillicents: 2,
  },
  "text-curie-001": {
    contextWindowSize: 2048,
    promptTokenCostInMillicents: 0.2,
    completionTokenCostInMillicents: 0.2,
  },
  curie: {
    contextWindowSize: 2048,
    promptTokenCostInMillicents: 0.2,
    completionTokenCostInMillicents: 0.2,
  },
  "text-babbage-001": {
    contextWindowSize: 2048,
    promptTokenCostInMillicents: 0.05,
    completionTokenCostInMillicents: 0.05,
  },
  babbage: {
    contextWindowSize: 2048,
    promptTokenCostInMillicents: 0.05,
    completionTokenCostInMillicents: 0.05,
  },
  "text-ada-001": {
    contextWindowSize: 2048,
    promptTokenCostInMillicents: 0.04,
    completionTokenCostInMillicents: 0.04,
  },
  ada: {
    contextWindowSize: 2048,
    promptTokenCostInMillicents: 0.04,
    completionTokenCostInMillicents: 0.04,
  },
};

export function getOpenAICompletionModelInformation(
  model: OpenAICompletionModelType
): {
  baseModel: OpenAICompletionBaseModelType;
  isFineTuned: boolean;
  contextWindowSize: number;
  promptTokenCostInMillicents: number;
  completionTokenCostInMillicents: number;
} {
  // Model is already a base model:
  if (model in OPENAI_TEXT_GENERATION_MODELS) {
    const baseModelInformation =
      OPENAI_TEXT_GENERATION_MODELS[model as OpenAICompletionBaseModelType];

    return {
      baseModel: model as OpenAICompletionBaseModelType,
      isFineTuned: false,
      contextWindowSize: baseModelInformation.contextWindowSize,
      promptTokenCostInMillicents:
        baseModelInformation.promptTokenCostInMillicents,
      completionTokenCostInMillicents:
        baseModelInformation.completionTokenCostInMillicents,
    };
  }

  // Extract the base model from the fine-tuned model:
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, baseModel, ___, ____, _____] = model.split(":");

  if (["davinci-002", "babbage-002"].includes(baseModel)) {
    const baseModelInformation =
      OPENAI_TEXT_GENERATION_MODELS[
        baseModel as FineTuneableOpenAICompletionModelType
      ];

    return {
      baseModel: baseModel as FineTuneableOpenAICompletionModelType,
      isFineTuned: true,
      contextWindowSize: baseModelInformation.contextWindowSize,
      promptTokenCostInMillicents:
        baseModelInformation.fineTunedTokenCostInMillicents,
      completionTokenCostInMillicents:
        baseModelInformation.fineTunedTokenCostInMillicents,
    };
  }

  throw new Error(`Unknown OpenAI chat base model ${baseModel}.`);
}

type FineTuneableOpenAICompletionModelType = "davinci-002" | "babbage-002";

type FineTunedOpenAICompletionModelType =
  `ft:${FineTuneableOpenAICompletionModelType}:${string}:${string}:${string}`;

export type OpenAICompletionBaseModelType =
  keyof typeof OPENAI_TEXT_GENERATION_MODELS;

export type OpenAICompletionModelType =
  | OpenAICompletionBaseModelType
  | FineTunedOpenAICompletionModelType;

export const isOpenAICompletionModel = (
  model: string
): model is OpenAICompletionModelType =>
  model in OPENAI_TEXT_GENERATION_MODELS ||
  model.startsWith("ft:davinci-002:") ||
  model.startsWith("ft:babbage-002:");

export const calculateOpenAICompletionCostInMillicents = ({
  model,
  response,
}: {
  model: OpenAICompletionModelType;
  response: OpenAICompletionResponse;
}) => {
  const modelInformation = getOpenAICompletionModelInformation(model);

  return (
    response.usage.prompt_tokens *
      modelInformation.promptTokenCostInMillicents +
    response.usage.completion_tokens *
      modelInformation.completionTokenCostInMillicents
  );
};

export interface OpenAICompletionCallSettings {
  api?: ApiConfiguration;

  model: OpenAICompletionModelType;

  suffix?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  n?: number;
  logprobs?: number;
  echo?: boolean;
  stop?: string | string[];
  presencePenalty?: number;
  frequencyPenalty?: number;
  bestOf?: number;
  logitBias?: Record<number, number>;
}

export interface OpenAICompletionModelSettings
  extends TextGenerationModelSettings,
    Omit<OpenAICompletionCallSettings, "stop" | "maxTokens"> {
  isUserIdForwardingEnabled?: boolean;
}

/**
 * Create a text generation model that calls the OpenAI text completion API.
 *
 * @see https://platform.openai.com/docs/api-reference/completions/create
 *
 * @example
 * const model = new OpenAICompletionModel({
 *   model: "gpt-3.5-turbo-instruct",
 *   temperature: 0.7,
 *   maxCompletionTokens: 500,
 *   retry: retryWithExponentialBackoff({ maxTries: 5 }),
 * });
 *
 * const text = await generateText(
 *   model,
 *   "Write a short story about a robot learning to love:\n\n"
 * );
 */
export class OpenAICompletionModel
  extends AbstractModel<OpenAICompletionModelSettings>
  implements TextStreamingModel<string, OpenAICompletionModelSettings>
{
  constructor(settings: OpenAICompletionModelSettings) {
    super({ settings });

    const modelInformation = getOpenAICompletionModelInformation(
      this.settings.model
    );

    this.tokenizer = new TikTokenTokenizer({
      model: modelInformation.baseModel,
    });
    this.contextWindowSize = modelInformation.contextWindowSize;
  }

  readonly provider = "openai" as const;
  get modelName() {
    return this.settings.model;
  }

  readonly contextWindowSize: number;
  readonly tokenizer: TikTokenTokenizer;

  async countPromptTokens(input: string) {
    return countTokens(this.tokenizer, input);
  }

  async callAPI<RESULT>(
    prompt: string,
    options: {
      responseFormat: OpenAITextResponseFormatType<RESULT>;
    } & FunctionOptions
  ): Promise<RESULT> {
    const { run, responseFormat } = options;

    const callSettings = {
      user: this.settings.isUserIdForwardingEnabled ? run?.userId : undefined,

      // Copied settings:
      ...this.settings,

      // map to OpenAI API names:
      stop: this.settings.stopSequences,
      maxTokens: this.settings.maxCompletionTokens,

      // other settings:
      abortSignal: run?.abortSignal,
      prompt,
      responseFormat,
    };

    return callWithRetryAndThrottle({
      retry: callSettings.api?.retry,
      throttle: callSettings.api?.throttle,
      call: async () => callOpenAICompletionAPI(callSettings),
    });
  }

  get settingsForEvent(): Partial<OpenAICompletionModelSettings> {
    const eventSettingProperties: Array<string> = [
      "maxCompletionTokens",
      "stopSequences",

      "suffix",
      "temperature",
      "topP",
      "n",
      "logprobs",
      "echo",
      "presencePenalty",
      "frequencyPenalty",
      "bestOf",
      "logitBias",
    ] satisfies (keyof OpenAICompletionModelSettings)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  async doGenerateText(prompt: string, options?: FunctionOptions) {
    const response = await this.callAPI(prompt, {
      ...options,
      responseFormat: OpenAITextResponseFormat.json,
    });

    return {
      response,
      text: response.choices[0]!.text,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      },
    };
  }

  doStreamText(prompt: string, options?: FunctionOptions) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: OpenAITextResponseFormat.deltaIterable,
    });
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
    OpenAICompletionModelSettings,
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

  withSettings(additionalSettings: Partial<OpenAICompletionModelSettings>) {
    return new OpenAICompletionModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const OpenAICompletionResponseSchema = z.object({
  id: z.string(),
  object: z.literal("text_completion"),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      text: z.string(),
      index: z.number(),
      logprobs: z.nullable(z.any()),
      finish_reason: z.string(),
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

async function callOpenAICompletionAPI<RESPONSE>({
  api = new OpenAIApiConfiguration(),
  abortSignal,
  responseFormat,
  model,
  prompt,
  suffix,
  maxTokens,
  temperature,
  topP,
  n,
  logprobs,
  echo,
  stop,
  presencePenalty,
  frequencyPenalty,
  bestOf,
  logitBias,
  user,
}: OpenAICompletionCallSettings & {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  responseFormat: OpenAITextResponseFormatType<RESPONSE>;
  prompt: string;
  user?: string;
}): Promise<RESPONSE> {
  // empty arrays are not allowed for stop:
  if (stop != null && Array.isArray(stop) && stop.length === 0) {
    stop = undefined;
  }

  return postJsonToApi({
    url: api.assembleUrl("/completions"),
    headers: api.headers,
    body: {
      stream: responseFormat.stream,
      model,
      prompt,
      suffix,
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      n,
      logprobs,
      echo,
      stop,
      presence_penalty: presencePenalty,
      frequency_penalty: frequencyPenalty,
      best_of: bestOf,
      logit_bias: logitBias,
      user,
    },
    failedResponseHandler: failedOpenAICallResponseHandler,
    successfulResponseHandler: responseFormat.handler,
    abortSignal,
  });
}

export type OpenAICompletionResponse = z.infer<
  typeof OpenAICompletionResponseSchema
>;

export type OpenAITextResponseFormatType<T> = {
  stream: boolean;
  handler: ResponseHandler<T>;
};

export const OpenAITextResponseFormat = {
  /**
   * Returns the response as a JSON object.
   */
  json: {
    stream: false,
    handler: createJsonResponseHandler(OpenAICompletionResponseSchema),
  } satisfies OpenAITextResponseFormatType<OpenAICompletionResponse>,

  /**
   * Returns an async iterable over the full deltas (all choices, including full current state at time of event)
   * of the response stream.
   */
  deltaIterable: {
    stream: true,
    handler: async ({ response }: { response: Response }) =>
      createOpenAITextFullDeltaIterableQueue(response.body!),
  } satisfies OpenAITextResponseFormatType<AsyncIterable<Delta<string>>>,
};

const textResponseStreamEventSchema = z.object({
  choices: z.array(
    z.object({
      text: z.string(),
      finish_reason: z.enum(["stop", "length"]).nullable(),
      index: z.number(),
    })
  ),
  created: z.number(),
  id: z.string(),
  model: z.string(),
  object: z.string(),
});

export type OpenAICompletionDelta = Array<{
  content: string;
  isComplete: boolean;
  delta: string;
}>;

async function createOpenAITextFullDeltaIterableQueue(
  stream: ReadableStream<Uint8Array>
): Promise<AsyncIterable<Delta<string>>> {
  const queue = new AsyncQueue<Delta<string>>();
  const streamDelta: OpenAICompletionDelta = [];

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

          const eventData = parseJsonWithZod(
            data,
            textResponseStreamEventSchema
          );

          for (let i = 0; i < eventData.choices.length; i++) {
            const eventChoice = eventData.choices[i];
            const delta = eventChoice.text;

            if (streamDelta[i] == null) {
              streamDelta[i] = {
                content: "",
                isComplete: false,
                delta: "",
              };
            }

            const choice = streamDelta[i];

            choice.delta = delta;

            if (eventChoice.finish_reason != null) {
              choice.isComplete = true;
            }

            choice.content += delta;
          }

          // Since we're mutating the choices array in an async scenario,
          // we need to make a deep copy:
          const streamDeltaDeepCopy = JSON.parse(JSON.stringify(streamDelta));

          queue.push({
            type: "delta",
            fullDelta: streamDeltaDeepCopy,
            valueDelta: streamDeltaDeepCopy[0].delta,
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
