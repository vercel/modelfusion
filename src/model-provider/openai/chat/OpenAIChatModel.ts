import z from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { AbstractModel } from "../../../model/AbstractModel.js";
import { FunctionOptions } from "../../../model/FunctionOptions.js";
import {
  JsonGenerationModel,
  JsonGenerationSchema,
} from "../../../model/json-generation/JsonGenerationModel.js";
import {
  TextGenerationModelSettings,
  TextGenerationModelWithTokenization,
} from "../../../model/text-generation/TextGenerationModel.js";
import { DeltaEvent } from "../../../model/text-streaming/DeltaEvent.js";
import {
  TextStreamingModel,
  TextStreamingModelSettings,
} from "../../../model/text-streaming/TextStreamingModel.js";
import { Tokenizer } from "../../../model/tokenization/Tokenizer.js";
import { callWithRetryAndThrottle } from "../../../util/api/callWithRetryAndThrottle.js";
import {
  ResponseHandler,
  createJsonResponseHandler,
  postJsonToApi,
} from "../../../util/api/postToApi.js";
import { OpenAIModelSettings } from "../OpenAIModelSettings.js";
import { TikTokenTokenizer } from "../TikTokenTokenizer.js";
import { failedOpenAICallResponseHandler } from "../failedOpenAICallResponseHandler.js";
import { OpenAIChatMessage } from "./OpenAIChatMessage.js";
import {
  OpenAIChatDelta,
  createOpenAIChatFullDeltaIterable,
  createOpenAIChatFullDeltaIterableQueue,
} from "./OpenAIChatStreamIterable.js";
import { countOpenAIChatPromptTokens } from "./countOpenAIChatMessageTokens.js";

/*
 * Available OpenAI chat models, their token limits, and pricing.
 *
 * @see https://platform.openai.com/docs/models/
 * @see https://openai.com/pricing
 */
export const OPENAI_CHAT_MODELS = {
  "gpt-4": {
    maxTokens: 8192,
    promptTokenCostInMillicents: 3,
    completionTokenCostInMillicents: 6,
  },
  "gpt-4-0314": {
    maxTokens: 8192,
    promptTokenCostInMillicents: 3,
    completionTokenCostInMillicents: 6,
  },
  "gpt-4-0613": {
    maxTokens: 8192,
    promptTokenCostInMillicents: 3,
    completionTokenCostInMillicents: 6,
  },
  "gpt-4-32k": {
    maxTokens: 32768,
    promptTokenCostInMillicents: 6,
    completionTokenCostInMillicents: 12,
  },
  "gpt-4-32k-0314": {
    maxTokens: 32768,
    promptTokenCostInMillicents: 6,
    completionTokenCostInMillicents: 12,
  },
  "gpt-4-32k-0613": {
    maxTokens: 32768,
    promptTokenCostInMillicents: 6,
    completionTokenCostInMillicents: 12,
  },
  "gpt-3.5-turbo": {
    maxTokens: 4096,
    promptTokenCostInMillicents: 0.15,
    completionTokenCostInMillicents: 0.2,
  },
  "gpt-3.5-turbo-0301": {
    maxTokens: 4096,
    promptTokenCostInMillicents: 0.15,
    completionTokenCostInMillicents: 0.2,
  },
  "gpt-3.5-turbo-0613": {
    maxTokens: 4096,
    promptTokenCostInMillicents: 0.15,
    completionTokenCostInMillicents: 0.2,
  },
  "gpt-3.5-turbo-16k": {
    maxTokens: 16384,
    promptTokenCostInMillicents: 0.3,
    completionTokenCostInMillicents: 0.4,
  },
  "gpt-3.5-turbo-16k-0613": {
    maxTokens: 16384,
    promptTokenCostInMillicents: 0.3,
    completionTokenCostInMillicents: 0.4,
  },
};

export type OpenAIChatModelType = keyof typeof OPENAI_CHAT_MODELS;

export const isOpenAIChatModel = (
  model: string
): model is OpenAIChatModelType => model in OPENAI_CHAT_MODELS;

export const calculateOpenAIChatCostInMillicents = ({
  model,
  response,
}: {
  model: OpenAIChatModelType;
  response: OpenAIChatResponse;
}): number =>
  response.usage.prompt_tokens *
    OPENAI_CHAT_MODELS[model].promptTokenCostInMillicents +
  response.usage.completion_tokens *
    OPENAI_CHAT_MODELS[model].completionTokenCostInMillicents;

export interface OpenAIChatCallSettings {
  model: OpenAIChatModelType;
  functions?: Array<{
    name: string;
    description?: string;
    parameters: any; // TODO JSON schema format validation?
  }>;
  functionCall?: "none" | "auto" | { name: string };
  temperature?: number;
  topP?: number;
  n?: number;
  stop?: string | string[];
  maxTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
}

export interface OpenAIChatSettings
  extends TextGenerationModelSettings,
    TextStreamingModelSettings,
    OpenAIModelSettings,
    OpenAIChatCallSettings {
  isUserIdForwardingEnabled?: boolean;
}

/**
 * Create a text generation model that calls the OpenAI chat completion API.
 *
 * @see https://platform.openai.com/docs/api-reference/chat/create
 *
 * @example
 * const model = new OpenAIChatModel({
 *   model: "gpt-3.5-turbo",
 *   temperature: 0.7,
 *   maxTokens: 500,
 * });
 *
 * const text = await model.generateText([
 *   OpenAIChatMessage.system(
 *     "Write a short story about a robot learning to love:"
 *   ),
 * ]);
 */
export class OpenAIChatModel
  extends AbstractModel<OpenAIChatSettings>
  implements
    TextGenerationModelWithTokenization<
      OpenAIChatMessage[],
      OpenAIChatResponse,
      OpenAIChatSettings
    >,
    TextStreamingModel<
      OpenAIChatMessage[],
      OpenAIChatDelta,
      OpenAIChatSettings
    >,
    JsonGenerationModel<
      OpenAIChatMessage[],
      OpenAIChatResponse,
      OpenAIChatSettings
    >
{
  constructor(settings: OpenAIChatSettings) {
    super({ settings });

    this.tokenizer = new TikTokenTokenizer({ model: this.settings.model });
    this.maxTokens = OPENAI_CHAT_MODELS[this.settings.model].maxTokens;
  }

  readonly provider = "openai" as const;
  get modelName() {
    return this.settings.model;
  }

  readonly tokenizer: Tokenizer;
  readonly maxTokens: number;

  private get apiKey() {
    const apiKey = this.settings.apiKey ?? process.env.OPENAI_API_KEY;

    if (apiKey == null) {
      throw new Error(
        `OpenAI API key is missing. Pass it as an argument to the constructor or set it as an environment variable named OPENAI_API_KEY.`
      );
    }

    return apiKey;
  }

  /**
   * Counts the prompt tokens required for the messages. This includes the message base tokens
   * and the prompt base tokens.
   */
  countPromptTokens(messages: OpenAIChatMessage[]) {
    return countOpenAIChatPromptTokens({
      messages,
      model: this.modelName,
    });
  }

  async callAPI<RESULT>(
    messages: Array<OpenAIChatMessage>,
    options: {
      responseFormat: OpenAIChatResponseFormatType<RESULT>;
    } & FunctionOptions<
      Partial<OpenAIChatCallSettings & OpenAIModelSettings & { user?: string }>
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
        messages,
        responseFormat,
      }
    );

    return callWithRetryAndThrottle({
      retry: callSettings.retry,
      throttle: callSettings.throttle,
      call: async () => callOpenAIChatCompletionAPI(callSettings),
    });
  }

  generateTextResponse(
    prompt: OpenAIChatMessage[],
    options?: FunctionOptions<OpenAIChatSettings>
  ) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: OpenAIChatResponseFormat.json,
    });
  }

  extractText(response: OpenAIChatResponse): string {
    return response.choices[0]!.message.content!;
  }

  generateDeltaStreamResponse(
    prompt: OpenAIChatMessage[],
    options?: FunctionOptions<OpenAIChatSettings>
  ) {
    return this.callAPI(prompt, {
      ...options,
      responseFormat: OpenAIChatResponseFormat.deltaIterable,
    });
  }

  extractTextDelta(fullDelta: OpenAIChatDelta): string | undefined {
    return fullDelta[0]?.delta.content ?? undefined;
  }

  /**
   * JSON generation uses the OpenAI GPT function calling API.
   * It provides a single function specification and instructs the model to provide parameters for calling the function.
   * The result is returned as parsed JSON.
   *
   * @see https://platform.openai.com/docs/guides/gpt/function-calling
   */
  generateJsonResponse<T>(
    prompt: OpenAIChatMessage[],
    schema: JsonGenerationSchema<T>,
    options?: FunctionOptions<OpenAIChatSettings> | undefined
  ): PromiseLike<OpenAIChatResponse> {
    const settingsWithFunctionCall = Object.assign({}, options, {
      functionCall: {
        name: schema.name,
      },
      functions: [
        {
          name: schema.name,
          description: schema.description,
          parameters: zodToJsonSchema(schema.parameters),
        },
      ],
    });

    return this.callAPI(prompt, {
      responseFormat: OpenAIChatResponseFormat.json,
      functionId: options?.functionId,
      settings: settingsWithFunctionCall,
      run: options?.run,
    });
  }

  extractJson<T>(
    response: OpenAIChatResponse,
    schema: JsonGenerationSchema<T>
  ): T {
    const jsonText = response.choices[0]!.message.function_call!.arguments;
    return schema.parameters.parse(JSON.parse(jsonText));
  }

  withSettings(additionalSettings: Partial<OpenAIChatSettings>) {
    return new OpenAIChatModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }

  withMaxTokens(maxTokens: number) {
    return this.withSettings({ maxTokens });
  }
}

const openAIChatResponseSchema = z.object({
  id: z.string(),
  object: z.literal("chat.completion"),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      message: z.object({
        role: z.literal("assistant"),
        content: z.string().nullable(),
        function_call: z
          .object({
            name: z.string(),
            arguments: z.string(),
          })
          .optional(),
      }),
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

export type OpenAIChatResponse = z.infer<typeof openAIChatResponseSchema>;

async function callOpenAIChatCompletionAPI<RESPONSE>({
  baseUrl = "https://api.openai.com/v1",
  abortSignal,
  responseFormat,
  apiKey,
  model,
  messages,
  functions,
  functionCall,
  temperature,
  topP,
  n,
  stop,
  maxTokens,
  presencePenalty,
  frequencyPenalty,
  user,
}: OpenAIChatCallSettings & {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  responseFormat: OpenAIChatResponseFormatType<RESPONSE>;
  apiKey: string;
  messages: Array<OpenAIChatMessage>;
  user?: string;
}): Promise<RESPONSE> {
  return postJsonToApi({
    url: `${baseUrl}/chat/completions`,
    apiKey,
    body: {
      stream: responseFormat.stream,
      model,
      messages,
      functions,
      function_call: functionCall,
      temperature,
      top_p: topP,
      n,
      stop,
      max_tokens: maxTokens,
      presence_penalty: presencePenalty,
      frequency_penalty: frequencyPenalty,
      user,
    },
    failedResponseHandler: failedOpenAICallResponseHandler,
    successfulResponseHandler: responseFormat.handler,
    abortSignal,
  });
}

export type OpenAIChatResponseFormatType<T> = {
  stream: boolean;
  handler: ResponseHandler<T>;
};

export const OpenAIChatResponseFormat = {
  /**
   * Returns the response as a JSON object.
   */
  json: {
    stream: false,
    handler: createJsonResponseHandler(openAIChatResponseSchema),
  } satisfies OpenAIChatResponseFormatType<OpenAIChatResponse>,

  /**
   * Returns an async iterable over the full deltas (all choices, including full current state at time of event)
   * of the response stream.
   */
  fullDeltaIterable: {
    stream: true,
    handler: async ({ response }: { response: Response }) =>
      createOpenAIChatFullDeltaIterable(response.body!),
  } satisfies OpenAIChatResponseFormatType<AsyncIterable<OpenAIChatDelta>>,

  /**
   * Returns an async iterable over the text deltas (only the tex different of the first choice).
   */
  deltaIterable: {
    stream: true,
    handler: async ({ response }: { response: Response }) =>
      createOpenAIChatFullDeltaIterableQueue(response.body!),
  } satisfies OpenAIChatResponseFormatType<
    AsyncIterable<DeltaEvent<OpenAIChatDelta>>
  >,
};
