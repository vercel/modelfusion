import { AbstractTextGenerationModel } from "../../../model/text-generation/AbstractTextGenerationModel.js";
import { RunContext } from "../../../run/RunContext.js";
import {
  TextGenerationModelSettings,
  TextGenerationModelWithTokenization,
} from "../../../model/text-generation/TextGenerationModel.js";
import { Tokenizer } from "../../../text/tokenize/Tokenizer.js";
import { RetryFunction } from "../../../util/retry/RetryFunction.js";
import { retryWithExponentialBackoff } from "../../../util/retry/retryWithExponentialBackoff.js";
import { throttleUnlimitedConcurrency } from "../../../util/throttle/UnlimitedConcurrencyThrottler.js";
import { ThrottleFunction } from "../../../util/throttle/ThrottleFunction.js";
import { TikTokenTokenizer } from "../TikTokenTokenizer.js";
import { OpenAIChatMessage } from "./OpenAIChatMessage.js";
import { OpenAIChatResponse } from "./OpenAIChatResponse.js";
import { callOpenAIChatCompletionAPI } from "./callOpenAIChatCompletionAPI.js";
import { countOpenAIChatPromptTokens } from "./countOpenAIChatMessageTokens.js";

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

export interface OpenAIChatModelSettings extends TextGenerationModelSettings {
  model: OpenAIChatModelType;

  baseUrl?: string;
  apiKey?: string;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;

  isUserIdForwardingEnabled?: boolean;

  temperature?: number;
  topP?: number;
  n?: number;
  stop?: string | string[];
  maxTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
}

/**
 * Create a text generation model that calls the OpenAI chat completion API.
 *
 * @see https://platform.openai.com/docs/api-reference/chat/create
 *
 * @example
 * const chatModel = new OpenAIChatModel({
 *   model: "gpt-3.5-turbo",
 *   temperature: 0.7,
 *   maxTokens: 500,
 * });
 *
 * const text = await chatModel.generateText([
 *   OpenAIChatMessage.system(
 *     "You are an AI assistant. Follow the user's instructions carefully."
 *   ),
 *   OpenAIChatMessage.user(
 *     "Write a short story about a robot learning to love:"
 *   ),
 * ]);
 */
export class OpenAIChatModel
  extends AbstractTextGenerationModel<
    OpenAIChatMessage[],
    OpenAIChatResponse,
    OpenAIChatModelSettings
  >
  implements
    TextGenerationModelWithTokenization<
      OpenAIChatMessage[],
      OpenAIChatModelSettings
    >
{
  constructor(settings: OpenAIChatModelSettings) {
    super({
      settings,
      extractText: (response) => response.choices[0]!.message.content,
      generateResponse: (prompt, run) => this.callAPI(prompt, run),
    });

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

  private get retry() {
    return this.settings.retry ?? retryWithExponentialBackoff();
  }

  private get throttle() {
    return this.settings.throttle ?? throttleUnlimitedConcurrency();
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

  async callAPI(
    input: Array<OpenAIChatMessage>,
    context?: RunContext
  ): Promise<OpenAIChatResponse> {
    return this.retry(async () =>
      this.throttle(async () =>
        callOpenAIChatCompletionAPI({
          abortSignal: context?.abortSignal,
          apiKey: this.apiKey,
          messages: input,
          user: this.settings.isUserIdForwardingEnabled
            ? context?.userId
            : undefined,
          ...this.settings,
        })
      )
    );
  }

  withSettings(additionalSettings: Partial<OpenAIChatModelSettings>) {
    return new OpenAIChatModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }

  withMaxTokens(maxTokens: number) {
    return this.withSettings({ maxTokens });
  }
}
