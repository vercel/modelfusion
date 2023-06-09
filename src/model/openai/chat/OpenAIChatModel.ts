import { createId } from "@paralleldrive/cuid2";
import { doGenerateText } from "../../../internal/doGenerateText.js";
import { PromptTemplate } from "../../../run/PromptTemplate.js";
import { RunContext } from "../../../run/RunContext.js";
import { RunObserver } from "../../../run/RunObserver.js";
import { TextGenerationModelWithTokenization } from "../../../text/generate/TextGenerationModel.js";
import { Tokenizer } from "../../../text/tokenize/Tokenizer.js";
import { RetryFunction } from "../../../util/retry/RetryFunction.js";
import { retryWithExponentialBackoff } from "../../../util/retry/retryWithExponentialBackoff.js";
import { throttleMaxConcurrency } from "../../../util/throttle/MaxConcurrentCallsThrottler.js";
import { ThrottleFunction } from "../../../util/throttle/ThrottleFunction.js";
import { TikTokenTokenizer } from "../tokenizer/TikTokenTokenizer.js";
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

export type OpenAIChatModelSettings = {
  model: OpenAIChatModelType;

  baseUrl?: string;
  apiKey?: string;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;
  observers?: Array<RunObserver>;
  uncaughtErrorHandler?: (error: unknown) => void;

  trimOutput?: boolean;

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
  implements TextGenerationModelWithTokenization<OpenAIChatMessage[]>
{
  readonly provider = "openai";

  readonly settings: OpenAIChatModelSettings;

  readonly tokenizer: Tokenizer;
  readonly maxTokens: number;

  constructor(settings: OpenAIChatModelSettings) {
    this.settings = settings;

    this.tokenizer = TikTokenTokenizer.forModel({ model: this.model });
    this.maxTokens = OPENAI_CHAT_MODELS[this.model].maxTokens;
  }

  private get apiKey() {
    const apiKey = this.settings.apiKey ?? process.env.OPENAI_API_KEY;

    if (apiKey == null) {
      throw new Error(
        `OpenAI API key is missing. Pass it as an argument to the constructor or set it as an environment variable named OPENAI_API_KEY.`
      );
    }

    return apiKey;
  }

  get model() {
    return this.settings.model;
  }

  get retry() {
    return this.settings.retry ?? retryWithExponentialBackoff();
  }

  get throttle() {
    return (
      this.settings.throttle ??
      throttleMaxConcurrency({ maxConcurrentCalls: 5 })
    );
  }

  get uncaughtErrorHandler() {
    return (
      this.settings.uncaughtErrorHandler ??
      ((error) => {
        console.error(error);
      })
    );
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

  async generateText(
    prompt: OpenAIChatMessage[],
    context?: RunContext
  ): Promise<string> {
    return await doGenerateText({
      prompt,
      generate: () => this.generate(prompt, context),
      extractText: async (response: OpenAIChatResponse) => {
        const text = response.choices[0]!.message.content;
        return this.settings.trimOutput ? text.trim() : text;
      },
      model: { provider: this.provider, name: this.model },
      createId,
      uncaughtErrorHandler: this.uncaughtErrorHandler,
      observers: this.settings.observers,
      context,
    });
  }

  generateTextAsFunction<INPUT>(
    promptTemplate: PromptTemplate<INPUT, OpenAIChatMessage[]>
  ) {
    return async (input: INPUT, context?: RunContext) => {
      const expandedPrompt = await promptTemplate(input);
      return this.generateText(expandedPrompt, context);
    };
  }

  withSettings(additionalSettings: Partial<OpenAIChatModelSettings>) {
    return new OpenAIChatModel(
      Object.assign({}, this.settings, additionalSettings)
    );
  }

  withMaxTokens(maxTokens: number) {
    return this.withSettings({ maxTokens });
  }
}
