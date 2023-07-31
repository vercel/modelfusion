import z from "zod";
import { AbstractModel } from "../../../model-function/AbstractModel.js";
import { FunctionOptions } from "../../../model-function/FunctionOptions.js";
import { GenerateJsonOrTextModel } from "../../../model-function/generate-json/GenerateJsonOrTextModel.js";
import { DeltaEvent } from "../../../model-function/generate-text/DeltaEvent.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "../../../model-function/generate-text/TextGenerationModel.js";
import { PromptMapping } from "../../../prompt/PromptMapping.js";
import { PromptMappingTextGenerationModel } from "../../../prompt/PromptMappingTextGenerationModel.js";
import { callWithRetryAndThrottle } from "../../../util/api/callWithRetryAndThrottle.js";
import {
  ResponseHandler,
  createJsonResponseHandler,
  postJsonToApi,
} from "../../../util/api/postToApi.js";
import { failedOpenAICallResponseHandler } from "../OpenAIError.js";
import { OpenAIModelSettings } from "../OpenAIModelSettings.js";
import { TikTokenTokenizer } from "../TikTokenTokenizer.js";
import { OpenAIChatMessage } from "./OpenAIChatMessage.js";
import {
  OpenAIChatAutoFunctionPrompt,
  OpenAIChatSingleFunctionPrompt,
  OpenAIFunctionDescription,
} from "./OpenAIChatPrompt.js";
import {
  OpenAIChatDelta,
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
    contextWindowSize: 8192,
    promptTokenCostInMillicents: 3,
    completionTokenCostInMillicents: 6,
  },
  "gpt-4-0314": {
    contextWindowSize: 8192,
    promptTokenCostInMillicents: 3,
    completionTokenCostInMillicents: 6,
  },
  "gpt-4-0613": {
    contextWindowSize: 8192,
    promptTokenCostInMillicents: 3,
    completionTokenCostInMillicents: 6,
  },
  "gpt-4-32k": {
    contextWindowSize: 32768,
    promptTokenCostInMillicents: 6,
    completionTokenCostInMillicents: 12,
  },
  "gpt-4-32k-0314": {
    contextWindowSize: 32768,
    promptTokenCostInMillicents: 6,
    completionTokenCostInMillicents: 12,
  },
  "gpt-4-32k-0613": {
    contextWindowSize: 32768,
    promptTokenCostInMillicents: 6,
    completionTokenCostInMillicents: 12,
  },
  "gpt-3.5-turbo": {
    contextWindowSize: 4096,
    promptTokenCostInMillicents: 0.15,
    completionTokenCostInMillicents: 0.2,
  },
  "gpt-3.5-turbo-0301": {
    contextWindowSize: 4096,
    promptTokenCostInMillicents: 0.15,
    completionTokenCostInMillicents: 0.2,
  },
  "gpt-3.5-turbo-0613": {
    contextWindowSize: 4096,
    promptTokenCostInMillicents: 0.15,
    completionTokenCostInMillicents: 0.2,
  },
  "gpt-3.5-turbo-16k": {
    contextWindowSize: 16384,
    promptTokenCostInMillicents: 0.3,
    completionTokenCostInMillicents: 0.4,
  },
  "gpt-3.5-turbo-16k-0613": {
    contextWindowSize: 16384,
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
    parameters: unknown;
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
    TextGenerationModel<
      OpenAIChatMessage[],
      OpenAIChatResponse,
      OpenAIChatDelta,
      OpenAIChatSettings
    >,
    GenerateJsonOrTextModel<
      | OpenAIChatSingleFunctionPrompt<unknown>
      | OpenAIChatAutoFunctionPrompt<Array<OpenAIFunctionDescription<unknown>>>,
      OpenAIChatResponse,
      OpenAIChatSettings
    >
{
  constructor(settings: OpenAIChatSettings) {
    super({ settings });

    this.tokenizer = new TikTokenTokenizer({ model: this.settings.model });
    this.contextWindowSize =
      OPENAI_CHAT_MODELS[this.settings.model].contextWindowSize;
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
  generateJsonResponse(
    prompt:
      | OpenAIChatSingleFunctionPrompt<unknown>
      | OpenAIChatAutoFunctionPrompt<Array<OpenAIFunctionDescription<unknown>>>,
    options?: FunctionOptions<OpenAIChatSettings> | undefined
  ): PromiseLike<OpenAIChatResponse> {
    const settingsWithFunctionCall = Object.assign({}, options, {
      functionCall: prompt.functionCall,
      functions: prompt.functions,
    });

    return this.callAPI(prompt.messages, {
      responseFormat: OpenAIChatResponseFormat.json,
      functionId: options?.functionId,
      settings: settingsWithFunctionCall,
      run: options?.run,
    });
  }

  mapPrompt<INPUT_PROMPT>(
    promptMapping: PromptMapping<INPUT_PROMPT, OpenAIChatMessage[]>
  ): PromptMappingTextGenerationModel<
    INPUT_PROMPT,
    OpenAIChatMessage[],
    OpenAIChatResponse,
    OpenAIChatDelta,
    OpenAIChatSettings,
    this
  > {
    return new PromptMappingTextGenerationModel({
      model: this.withStopTokens(promptMapping.stopTokens),
      promptMapping,
    });
  }

  withSettings(additionalSettings: Partial<OpenAIChatSettings>) {
    return new OpenAIChatModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }

  get maxCompletionTokens() {
    return this.settings.maxTokens;
  }

  withMaxCompletionTokens(maxCompletionTokens: number) {
    return this.withSettings({ maxTokens: maxCompletionTokens });
  }

  withStopTokens(stopTokens: string[]): this {
    return this.withSettings({ stop: stopTokens });
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
