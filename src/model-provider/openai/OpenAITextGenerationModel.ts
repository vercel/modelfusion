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
import { countTokens } from "../../model-function/tokenize-text/countTokens.js";
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
import { failedOpenAICallResponseHandler } from "./OpenAIError.js";
import { OpenAIImageGenerationCallSettings } from "./OpenAIImageGenerationModel.js";
import { OpenAIModelSettings } from "./OpenAIModelSettings.js";
import { TikTokenTokenizer } from "./TikTokenTokenizer.js";

/**
 * @see https://platform.openai.com/docs/models/
 * @see https://openai.com/pricing
 */
export const OPENAI_TEXT_GENERATION_MODELS = {
  "text-davinci-003": {
    contextWindowSize: 4096,
    tokenCostInMillicents: 2,
  },
  "text-davinci-002": {
    contextWindowSize: 4096,
    tokenCostInMillicents: 2,
  },
  "code-davinci-002": {
    contextWindowSize: 8000,
    tokenCostInMillicents: 2,
  },
  davinci: {
    contextWindowSize: 2048,
    tokenCostInMillicents: 2,
  },
  "text-curie-001": {
    contextWindowSize: 2048,
    tokenCostInMillicents: 0.2,
  },
  curie: {
    contextWindowSize: 2048,
    tokenCostInMillicents: 0.2,
  },
  "text-babbage-001": {
    contextWindowSize: 2048,
    tokenCostInMillicents: 0.05,
  },
  babbage: {
    contextWindowSize: 2048,
    tokenCostInMillicents: 0.05,
  },
  "text-ada-001": {
    contextWindowSize: 2048,
    tokenCostInMillicents: 0.04,
  },
  ada: {
    contextWindowSize: 2048,
    tokenCostInMillicents: 0.04,
  },
};

export type OpenAITextGenerationModelType =
  keyof typeof OPENAI_TEXT_GENERATION_MODELS;

export const isOpenAITextGenerationModel = (
  model: string
): model is OpenAITextGenerationModelType =>
  model in OPENAI_TEXT_GENERATION_MODELS;

export const calculateOpenAITextGenerationCostInMillicents = ({
  model,
  response,
}: {
  model: OpenAITextGenerationModelType;
  response: OpenAITextGenerationResponse;
}) =>
  response.usage.total_tokens *
  OPENAI_TEXT_GENERATION_MODELS[model].tokenCostInMillicents;

export interface OpenAITextGenerationModelSettings
  extends TextGenerationModelSettings {
  model: OpenAITextGenerationModelType;

  headers?: Record<string, string>;

  baseUrl?: string;
  apiKey?: string;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;

  isUserIdForwardingEnabled?: boolean;

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
}

/**
 * Create a text generation model that calls the OpenAI text completion API.
 *
 * @see https://platform.openai.com/docs/api-reference/completions/create
 *
 * @example
 * const model = new OpenAITextGenerationModel({
 *   model: "text-davinci-003",
 *   temperature: 0.7,
 *   maxTokens: 500,
 *   retry: retryWithExponentialBackoff({ maxTries: 5 }),
 * });
 *
 * const text = await generateText(
 *   model,
 *   "Write a short story about a robot learning to love:\n\n"
 * );
 */
export class OpenAITextGenerationModel
  extends AbstractModel<OpenAITextGenerationModelSettings>
  implements
    TextGenerationModel<
      string,
      OpenAITextGenerationResponse,
      OpenAITextGenerationDelta,
      OpenAITextGenerationModelSettings
    >
{
  constructor(settings: OpenAITextGenerationModelSettings) {
    super({ settings });

    this.tokenizer = new TikTokenTokenizer({ model: settings.model });
    this.contextWindowSize =
      OPENAI_TEXT_GENERATION_MODELS[settings.model].contextWindowSize;
  }

  readonly provider = "openai" as const;
  get modelName() {
    return this.settings.model;
  }

  readonly contextWindowSize: number;
  readonly tokenizer: TikTokenTokenizer;

  private get apiKey() {
    const apiKey = this.settings.apiKey ?? process.env.OPENAI_API_KEY;

    if (apiKey == null) {
      throw new Error(
        `OpenAI API key is missing. Pass it as an argument to the constructor or set it as an environment variable named OPENAI_API_KEY.`
      );
    }

    return apiKey;
  }

  async countPromptTokens(input: string) {
    return countTokens(this.tokenizer, input);
  }

  async callAPI<RESULT>(
    prompt: string,
    options: {
      responseFormat: OpenAITextResponseFormatType<RESULT>;
    } & FunctionOptions<
      Partial<
        OpenAIImageGenerationCallSettings &
          OpenAIModelSettings & { user?: string }
      >
    >
  ): Promise<RESULT> {
    const { run, settings, responseFormat } = options;

    const callSettings = Object.assign(
      {
        apiKey: this.apiKey,
        user: this.settings.isUserIdForwardingEnabled ? run?.userId : undefined,
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
      retry: callSettings.retry,
      throttle: callSettings.throttle,
      call: async () => callOpenAITextGenerationAPI(callSettings),
    });
  }

  generateTextResponse(
    prompt: string,
    options?: FunctionOptions<OpenAITextGenerationModelSettings>
  ) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: OpenAITextResponseFormat.json,
    });
  }

  extractText(response: OpenAITextGenerationResponse): string {
    return response.choices[0]!.text;
  }

  generateDeltaStreamResponse(
    prompt: string,
    options?: FunctionOptions<OpenAITextGenerationModelSettings>
  ) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: OpenAITextResponseFormat.deltaIterable,
    });
  }

  extractTextDelta(fullDelta: OpenAITextGenerationDelta): string | undefined {
    return fullDelta[0].delta;
  }

  mapPrompt<INPUT_PROMPT>(
    promptMapping: PromptMapping<INPUT_PROMPT, string>
  ): PromptMappingTextGenerationModel<
    INPUT_PROMPT,
    string,
    OpenAITextGenerationResponse,
    OpenAITextGenerationDelta,
    OpenAITextGenerationModelSettings,
    this
  > {
    return new PromptMappingTextGenerationModel({
      model: this.withStopTokens(promptMapping.stopTokens),
      promptMapping,
    });
  }

  withSettings(additionalSettings: Partial<OpenAITextGenerationModelSettings>) {
    return new OpenAITextGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }

  get maxCompletionTokens() {
    return this.settings.maxTokens;
  }

  withMaxCompletionTokens(maxCompletionTokens: number) {
    return this.withSettings({ maxTokens: maxCompletionTokens });
  }

  withStopTokens(stopTokens: string[]) {
    return this.withSettings({ stop: stopTokens });
  }
}

const openAITextGenerationResponseSchema = z.object({
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

/**
 * Call the OpenAI Text Completion API to generate a text completion for the given prompt.
 *
 * @see https://platform.openai.com/docs/api-reference/completions/create
 *
 * @example
 * const response = await callOpenAITextGenerationAPI({
 *   apiKey: OPENAI_API_KEY,
 *   model: "text-davinci-003",
 *   prompt: "Write a short story about a robot learning to love:\n\n",
 *   temperature: 0.7,
 *   maxTokens: 500,
 * });
 *
 * console.log(response.choices[0].text);
 */
async function callOpenAITextGenerationAPI<RESPONSE>({
  baseUrl = "https://api.openai.com/v1",
  headers,
  abortSignal,
  responseFormat,
  apiKey,
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
  user,
}: {
  baseUrl?: string;
  headers?: Record<string, string>;
  abortSignal?: AbortSignal;
  responseFormat: OpenAITextResponseFormatType<RESPONSE>;
  apiKey: string;
  model: OpenAITextGenerationModelType;
  prompt: string;
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
  user?: string;
}): Promise<RESPONSE> {
  return postJsonToApi({
    url: `${baseUrl}/completions`,
    headers: {
      ...headers,
      Authorization: `Bearer ${apiKey}`,
    },
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
      user,
    },
    failedResponseHandler: failedOpenAICallResponseHandler,
    successfulResponseHandler: responseFormat.handler,
    abortSignal,
  });
}

export type OpenAITextGenerationResponse = z.infer<
  typeof openAITextGenerationResponseSchema
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
    handler: createJsonResponseHandler(openAITextGenerationResponseSchema),
  } satisfies OpenAITextResponseFormatType<OpenAITextGenerationResponse>,

  /**
   * Returns an async iterable over the full deltas (all choices, including full current state at time of event)
   * of the response stream.
   */
  deltaIterable: {
    stream: true,
    handler: async ({ response }: { response: Response }) =>
      createOpenAITextFullDeltaIterableQueue(response.body!),
  } satisfies OpenAITextResponseFormatType<
    AsyncIterable<DeltaEvent<OpenAITextGenerationDelta>>
  >,
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

export type OpenAITextGenerationDelta = Array<{
  content: string;
  isComplete: boolean;
  delta: string;
}>;

async function createOpenAITextFullDeltaIterableQueue(
  stream: ReadableStream<Uint8Array>
): Promise<AsyncIterable<DeltaEvent<OpenAITextGenerationDelta>>> {
  const queue = new AsyncQueue<DeltaEvent<OpenAITextGenerationDelta>>();
  const streamDelta: OpenAITextGenerationDelta = [];

  // process the stream asynchonously (no 'await' on purpose):
  parseEventSourceReadableStream({
    stream,
    callback: (event) => {
      if (event.type !== "event") {
        return;
      }

      const data = event.data;

      if (data === "[DONE]") {
        queue.close();
        return;
      }

      try {
        const json = SecureJSON.parse(data);
        const parseResult = textResponseStreamEventSchema.safeParse(json);

        if (!parseResult.success) {
          queue.push({
            type: "error",
            error: parseResult.error,
          });
          queue.close();
          return;
        }

        const event = parseResult.data;

        for (let i = 0; i < event.choices.length; i++) {
          const eventChoice = event.choices[i];
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
        });
      } catch (error) {
        queue.push({ type: "error", error });
        queue.close();
        return;
      }
    },
  });

  return queue;
}
