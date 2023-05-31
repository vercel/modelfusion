import { RunContext } from "../../../run/RunContext.js";
import { TextGenerationModel } from "../../../text/generate/TextGenerationModel.js";
import { Tokenizer } from "../../../text/tokenize/Tokenizer.js";
import { TokenizerModel } from "../../../text/tokenize/TokenizerModel.js";
import { getTiktokenTokenizerForModel } from "../tokenizer/tiktoken.js";
import {
  OpenAIChatCompletion,
  OpenAIChatMessage,
} from "./OpenAIChatCompletion.js";
import { countOpenAIChatPromptTokens } from "./countOpenAIChatMessageTokens.js";
import { generateOpenAIChatCompletion } from "./generateOpenAIChatCompletion.js";

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
  maxCompletionTokens?: number;
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
 *   .withSettings({ maxCompletionTokens: 500 })
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
 * const text = await chatModel.extractOutput(response);
 */
export class OpenAIChatModel
  implements
    TextGenerationModel<OpenAIChatMessage[], OpenAIChatCompletion, string>,
    TokenizerModel<number[]>
{
  readonly provider = "openai";

  readonly baseUrl?: string;
  readonly apiKey: string;

  readonly model: OpenAIChatModelType;
  readonly settings: OpenAIChatModelSettings;

  readonly tokenizer: Tokenizer<number[]>;
  readonly maxTokens: number;

  constructor({
    baseUrl,
    apiKey,
    model,
    settings = {},
  }: {
    baseUrl?: string;
    apiKey: string;
    model: OpenAIChatModelType;
    settings?: OpenAIChatModelSettings;
  }) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.model = model;
    this.settings = settings;

    this.tokenizer = getTiktokenTokenizerForModel({ model });
    this.maxTokens = OPENAI_CHAT_MODELS[model].maxTokens;
  }

  countPromptTokens(messages: OpenAIChatMessage[]) {
    return countOpenAIChatPromptTokens({
      messages,
      model: this.model,
    });
  }

  async generate(
    input: Array<OpenAIChatMessage>,
    context?: RunContext
  ): Promise<OpenAIChatCompletion> {
    return generateOpenAIChatCompletion({
      baseUrl: this.baseUrl,
      abortSignal: context?.abortSignal,
      apiKey: this.apiKey,
      messages: input,
      model: this.model,
      user: this.settings.isUserIdForwardingEnabled
        ? context?.userId
        : undefined,
      ...this.settings,
    });
  }

  async extractOutput(rawOutput: OpenAIChatCompletion): Promise<string> {
    return rawOutput.choices[0]!.message.content;
  }

  withSettings(additionalSettings: OpenAIChatModelSettings) {
    return new OpenAIChatModel({
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      model: this.model,
      settings: Object.assign({}, this.settings, additionalSettings),
    });
  }
}
