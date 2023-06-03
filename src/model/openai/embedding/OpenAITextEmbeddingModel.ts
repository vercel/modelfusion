import { RunContext } from "../../../run/RunContext.js";
import { TextEmbeddingModel } from "../../../text/embed/TextEmbeddingModel.js";
import { TokenizationSupport } from "../../../text/tokenize/TokenizationSupport.js";
import { Tokenizer } from "../../../text/tokenize/Tokenizer.js";
import { RetryFunction } from "../../../util/retry/RetryFunction.js";
import { retryWithExponentialBackoff } from "../../../util/retry/retryWithExponentialBackoff.js";
import { throttleMaxConcurrency } from "../../../util/throttle/MaxConcurrentCallsThrottler.js";
import { ThrottleFunction } from "../../../util/throttle/ThrottleFunction.js";
import { TikTokenTokenizer } from "../tokenizer/TikTokenTokenizer.js";
import {
  OpenAITextEmbeddingResponse,
  generateOpenAITextEmbedding,
} from "./generateOpenAITextEmbedding.js";

export const OPENAI_TEXT_EMBEDDING_MODELS = {
  "text-embedding-ada-002": {
    maxTokens: 8192,
    embeddingDimensions: 1536,
  },
};

export type OpenAITextEmbeddingModelType =
  keyof typeof OPENAI_TEXT_EMBEDDING_MODELS;

export type OpenAITextEmbeddingModelSettings = {
  isUserIdForwardingEnabled?: boolean;
};

/**
 * Create a text embedding model that calls the OpenAI embedding API.
 *
 * @see https://platform.openai.com/docs/api-reference/embeddings
 *
 * @example
 * const embeddingModel = new OpenAITextEmbeddingModel({
 *   apiKey: OPENAI_API_KEY,
 *   model: "text-embedding-ada-002",
 * });
 *
 * const response = await embeddingModel.embed([
 *   "At first, Nox didn't know what to do with the pup.",
 * ]);
 *
 * const embeddings = await embeddingModel.extractEmbeddings(response);
 */
export class OpenAITextEmbeddingModel
  implements
    TextEmbeddingModel<OpenAITextEmbeddingResponse>,
    TokenizationSupport
{
  readonly provider = "openai";

  readonly baseUrl?: string;
  readonly apiKey: string;
  readonly model: OpenAITextEmbeddingModelType;
  readonly settings: OpenAITextEmbeddingModelSettings;

  readonly retry: RetryFunction;
  readonly throttle: ThrottleFunction;

  readonly tokenizer: Tokenizer;
  readonly maxTokens: number;

  readonly maxTextsPerCall = 1;
  readonly embeddingDimensions: number;

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
    model: OpenAITextEmbeddingModelType;
    settings?: OpenAITextEmbeddingModelSettings;
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
    this.maxTokens = OPENAI_TEXT_EMBEDDING_MODELS[model].maxTokens;

    this.embeddingDimensions =
      OPENAI_TEXT_EMBEDDING_MODELS[model].embeddingDimensions;
  }

  async countTokens(input: string) {
    return this.tokenizer.countTokens(input);
  }

  async embed(
    texts: Array<string>,
    context?: RunContext
  ): Promise<OpenAITextEmbeddingResponse> {
    if (texts.length > this.maxTextsPerCall) {
      throw new Error(
        `The OpenAI embedding API only supports ${this.maxTextsPerCall} texts per API call.`
      );
    }

    return this.retry(async () =>
      this.throttle(async () =>
        generateOpenAITextEmbedding({
          baseUrl: this.baseUrl,
          abortSignal: context?.abortSignal,
          apiKey: this.apiKey,
          input: texts[0],
          model: this.model,
          user: this.settings.isUserIdForwardingEnabled
            ? context?.userId
            : undefined,
        })
      )
    );
  }

  async extractEmbeddings(
    rawOutput: OpenAITextEmbeddingResponse
  ): Promise<Array<Array<number>>> {
    return [rawOutput.data[0]!.embedding];
  }

  withSettings(additionalSettings: OpenAITextEmbeddingModelSettings) {
    return new OpenAITextEmbeddingModel({
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      model: this.model,
      settings: Object.assign({}, this.settings, additionalSettings),
      retry: this.retry,
      throttle: this.throttle,
    });
  }
}
