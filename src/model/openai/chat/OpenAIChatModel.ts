import { RunContext } from "../../../run/RunContext.js";
import { TextGenerationModelWithTokenization } from "../../../text/generate/TextGenerationModel.js";
import { Tokenizer } from "../../../text/tokenize/Tokenizer.js";
import { RetryFunction } from "../../../util/retry/RetryFunction.js";
import { retryWithExponentialBackoff } from "../../../util/retry/retryWithExponentialBackoff.js";
import { throttleMaxConcurrency } from "../../../util/throttle/MaxConcurrentCallsThrottler.js";
import { ThrottleFunction } from "../../../util/throttle/ThrottleFunction.js";
import { TikTokenTokenizer } from "../tokenizer/TikTokenTokenizer.js";
import { OpenAIChatMessage } from "./OpenAIChatMessage.js";
import { countOpenAIChatPromptTokens } from "./countOpenAIChatMessageTokens.js";
import {
  OpenAIChatResponse,
  callOpenAIChatCompletionAPI,
} from "./callOpenAIChatCompletionAPI.js";

// see https://platform.openai.com/docs/models/
export const OPENAI_CHAT_MODELS = {
  "gpt-4": {
    maxTokens: 8192,
  },
  "gpt-4-0314": {
    maxTokens: 8192,
  },
  "gpt-4-32k": {
    maxTokens: 32768,
  },
  "gpt-4-32k-0314": {
    maxTokens: 32768,
  },
  "gpt-3.5-turbo": {
    maxTokens: 4096,
  },
  "gpt-3.5-turbo-0301": {
    maxTokens: 4096,
  },
};

export type OpenAIChatModelType = keyof typeof OPENAI_CHAT_MODELS;

export type OpenAIChatModelSettings = {
  isUserIdForwardingEnabled?: boolean;

  temperature?: number;
  topP?: number;
  n?: number;
  stop?: string | string[];
  maxTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
};

/**
 * Create a text generation model that calls the OpenAI chat completion API.
 *
 * @see https://platform.openai.com/docs/api-reference/chat/create
 *
 * @example
 * const chatModel = new OpenAIChatModel({
 *   apiKey: OPENAI_API_KEY,
 *   model: "gpt-3.5-turbo",
 *   settings: { temperature: 0.7 },
 * });
 *
 * const response = await chatModel
 *   .withSettings({ maxTokens: 500 })
 *   .generate([
 *     {
 *       role: "system",
 *       content:
 *         "You are an AI assistant. Follow the user's instructions carefully.",
 *     },
 *     {
 *       role: "user",
 *       content: "Hello, how are you?",
 *     },
 *   ]);
 *
 * const text = await chatModel.extractText(response);
 */
export class OpenAIChatModel
  implements
    TextGenerationModelWithTokenization<
      OpenAIChatMessage[],
      OpenAIChatResponse
    >
{
  readonly provider = "openai";

  readonly baseUrl?: string;
  readonly apiKey: string;
  readonly model: OpenAIChatModelType;
  readonly settings: OpenAIChatModelSettings;

  readonly retry: RetryFunction;
  readonly throttle: ThrottleFunction;

  readonly tokenizer: Tokenizer;
  readonly maxTokens: number;

  constructor({
    baseUrl,
    apiKey,
    model,
    settings = {},
    retry = retryWithExponentialBackoff(),
    throttle = throttleMaxConcurrency({ maxConcurrentCalls: 5 }),
  }: {
    baseUrl?: string;
    apiKey: string;
    model: OpenAIChatModelType;
    settings?: OpenAIChatModelSettings;
    retry?: RetryFunction;
    throttle?: ThrottleFunction;
  }) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.model = model;
    this.settings = settings;

    this.retry = retry;
    this.throttle = throttle;

    this.tokenizer = TikTokenTokenizer.forModel({ model });
    this.maxTokens = OPENAI_CHAT_MODELS[model].maxTokens;
  }

  /**
   * Counts the prompt tokens required for the messages. This includes the message base tokens
   * and the prompt base tokens.
   */
  countPromptTokens(messages: OpenAIChatMessage[]) {
    return countOpenAIChatPromptTokens({
      messages,
      model: this.model,
    });
  }

  async generate(
    input: Array<OpenAIChatMessage>,
    context?: RunContext
  ): Promise<OpenAIChatResponse> {
    return this.retry(async () =>
      this.throttle(async () =>
        callOpenAIChatCompletionAPI({
          baseUrl: this.baseUrl,
          abortSignal: context?.abortSignal,
          apiKey: this.apiKey,
          messages: input,
          model: this.model,
          user: this.settings.isUserIdForwardingEnabled
            ? context?.userId
            : undefined,
          ...this.settings,
        })
      )
    );
  }

  async extractText(rawOutput: OpenAIChatResponse): Promise<string> {
    return rawOutput.choices[0]!.message.content;
  }

  withSettings(additionalSettings: OpenAIChatModelSettings) {
    return new OpenAIChatModel({
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      model: this.model,
      settings: Object.assign({}, this.settings, additionalSettings),
      retry: this.retry,
      throttle: this.throttle,
    });
  }

  withMaxTokens(maxTokens: number) {
    return this.withSettings({ maxTokens });
  }
}
