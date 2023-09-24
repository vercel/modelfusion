import SecureJSON from "secure-json-parse";
import z from "zod";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { ModelFunctionOptions } from "../../model-function/ModelFunctionOptions.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { AsyncQueue } from "../../event-source/AsyncQueue.js";
import { DeltaEvent } from "../../model-function/generate-text/DeltaEvent.js";

import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../../model-function/generate-text/TextGenerationModel.js";
import { parseEventSourceReadableStream } from "../../event-source/parseEventSourceReadableStream.js";
import { countTokens } from "../../model-function/tokenize-text/countTokens.js";
import { PromptFormat } from "../../prompt/PromptFormat.js";
import { PromptFormatTextGenerationModel } from "../../prompt/PromptFormatTextGenerationModel.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  ResponseHandler,
  createJsonResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi.js";
import { OpenAIApiConfiguration } from "./OpenAIApiConfiguration.js";
import { failedOpenAICallResponseHandler } from "./OpenAIError.js";
import { OpenAIImageGenerationCallSettings } from "./OpenAIImageGenerationModel.js";
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

export function getOpenAITextGenerationModelInformation(
  model: OpenAITextGenerationModelType
): {
  baseModel: OpenAITextGenerationBaseModelType;
  isFineTuned: boolean;
  contextWindowSize: number;
  promptTokenCostInMillicents: number;
  completionTokenCostInMillicents: number;
} {
  // Model is already a base model:
  if (model in OPENAI_TEXT_GENERATION_MODELS) {
    const baseModelInformation =
      OPENAI_TEXT_GENERATION_MODELS[model as OpenAITextGenerationBaseModelType];

    return {
      baseModel: model as OpenAITextGenerationBaseModelType,
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
        baseModel as FineTuneableOpenAITextGenerationModelType
      ];

    return {
      baseModel: baseModel as FineTuneableOpenAITextGenerationModelType,
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

type FineTuneableOpenAITextGenerationModelType = "davinci-002" | "babbage-002";

type FineTunedOpenAITextGenerationModelType =
  `ft:${FineTuneableOpenAITextGenerationModelType}:${string}:${string}:${string}`;

export type OpenAITextGenerationBaseModelType =
  keyof typeof OPENAI_TEXT_GENERATION_MODELS;

export type OpenAITextGenerationModelType =
  | OpenAITextGenerationBaseModelType
  | FineTunedOpenAITextGenerationModelType;

export const isOpenAITextGenerationModel = (
  model: string
): model is OpenAITextGenerationModelType =>
  model in OPENAI_TEXT_GENERATION_MODELS ||
  model.startsWith("ft:davinci-002:") ||
  model.startsWith("ft:babbage-002:");

export const calculateOpenAITextGenerationCostInMillicents = ({
  model,
  response,
}: {
  model: OpenAITextGenerationModelType;
  response: OpenAITextGenerationResponse;
}) => {
  const modelInformation = getOpenAITextGenerationModelInformation(model);

  return (
    response.usage.prompt_tokens *
      modelInformation.promptTokenCostInMillicents +
    response.usage.completion_tokens *
      modelInformation.completionTokenCostInMillicents
  );
};

export interface OpenAITextGenerationCallSettings {
  api?: ApiConfiguration;

  model: OpenAITextGenerationModelType;

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

export interface OpenAITextGenerationModelSettings
  extends TextGenerationModelSettings,
    Omit<OpenAITextGenerationCallSettings, "stop" | "maxTokens"> {
  isUserIdForwardingEnabled?: boolean;
}

/**
 * Create a text generation model that calls the OpenAI text completion API.
 *
 * @see https://platform.openai.com/docs/api-reference/completions/create
 *
 * @example
 * const model = new OpenAITextGenerationModel({
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

    const modelInformation = getOpenAITextGenerationModelInformation(
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
    } & ModelFunctionOptions<
      Partial<OpenAIImageGenerationCallSettings & { user?: string }>
    >
  ): Promise<RESULT> {
    const { run, settings, responseFormat } = options;

    const combinedSettings = {
      ...this.settings,
      ...settings,
    };

    const callSettings = {
      user: this.settings.isUserIdForwardingEnabled ? run?.userId : undefined,

      // Copied settings:
      ...combinedSettings,

      // map to OpenAI API names:
      stop: combinedSettings.stopSequences,
      maxTokens: combinedSettings.maxCompletionTokens,

      // other settings:
      abortSignal: run?.abortSignal,
      prompt,
      responseFormat,
    };

    return callWithRetryAndThrottle({
      retry: callSettings.api?.retry,
      throttle: callSettings.api?.throttle,
      call: async () => callOpenAITextGenerationAPI(callSettings),
    });
  }

  get settingsForEvent(): Partial<OpenAITextGenerationModelSettings> {
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
    ] satisfies (keyof OpenAITextGenerationModelSettings)[];

    return Object.fromEntries(
      Object.entries(this.settings).filter(([key]) =>
        eventSettingProperties.includes(key)
      )
    );
  }

  generateTextResponse(
    prompt: string,
    options?: ModelFunctionOptions<OpenAITextGenerationModelSettings>
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
    options?: ModelFunctionOptions<OpenAITextGenerationModelSettings>
  ) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: OpenAITextResponseFormat.deltaIterable,
    });
  }

  extractTextDelta(fullDelta: OpenAITextGenerationDelta): string | undefined {
    return fullDelta[0].delta;
  }

  withPromptFormat<INPUT_PROMPT>(
    promptFormat: PromptFormat<INPUT_PROMPT, string>
  ): PromptFormatTextGenerationModel<
    INPUT_PROMPT,
    string,
    OpenAITextGenerationResponse,
    OpenAITextGenerationDelta,
    OpenAITextGenerationModelSettings,
    this
  > {
    return new PromptFormatTextGenerationModel({
      model: this.withSettings({
        stopSequences: promptFormat.stopSequences,
      }),
      promptFormat,
    });
  }

  extractUsage(response: OpenAITextGenerationResponse) {
    return {
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens,
    };
  }

  withSettings(additionalSettings: Partial<OpenAITextGenerationModelSettings>) {
    return new OpenAITextGenerationModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
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

async function callOpenAITextGenerationAPI<RESPONSE>({
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
}: OpenAITextGenerationCallSettings & {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  responseFormat: OpenAITextResponseFormatType<RESPONSE>;
  prompt: string;
  user?: string;
}): Promise<RESPONSE> {
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
