import z from "zod";
import { FunctionOptions } from "../../model/FunctionOptions.js";
import { AbstractTextEmbeddingModel } from "../../model/text-embedding/AbstractTextEmbeddingModel.js";
import { TextEmbeddingModelSettings } from "../../model/text-embedding/TextEmbeddingModel.js";
import { TokenizationSupport } from "../../model/tokenization/TokenizationSupport.js";
import { Tokenizer } from "../../model/tokenization/Tokenizer.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../util/api/postToApi.js";
import { CohereTokenizer } from "./CohereTokenizer.js";
import { failedCohereCallResponseHandler } from "./failedCohereCallResponseHandler.js";

export const COHERE_TEXT_EMBEDDING_MODELS = {
  "embed-english-light-v2.0": {
    maxTokens: 4096,
    embeddingDimensions: 1024,
  },
  "embed-english-v2.0": {
    maxTokens: 4096,
    embeddingDimensions: 4096,
  },
  "embed-multilingual-v2.0": {
    maxTokens: 4096,
    embeddingDimensions: 768,
  },
};

export type CohereTextEmbeddingModelType =
  keyof typeof COHERE_TEXT_EMBEDDING_MODELS;

export interface CohereTextEmbeddingModelSettings
  extends TextEmbeddingModelSettings {
  model: CohereTextEmbeddingModelType;

  baseUrl?: string;
  apiKey?: string;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;

  tokenizerSettings?: {
    retry?: RetryFunction;
    throttle?: ThrottleFunction;
  };

  truncate?: "NONE" | "START" | "END";
}

/**
 * Create a text embedding model that calls the Cohere Co.Embed API.
 *
 * @see https://docs.cohere.com/reference/embed
 *
 * @example
 * const model = new CohereTextEmbeddingModel({
 *   model: "embed-english-light-v2.0",
 * });
 *
 * const embeddings = await model.embedTexts([
 *   "At first, Nox didn't know what to do with the pup.",
 *   "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
 * ]);
 */
export class CohereTextEmbeddingModel
  extends AbstractTextEmbeddingModel<
    CohereTextEmbeddingResponse,
    CohereTextEmbeddingModelSettings
  >
  implements TokenizationSupport
{
  constructor(settings: CohereTextEmbeddingModelSettings) {
    super({
      settings,
      extractEmbeddings: (response) => response.embeddings,
      generateResponse: (texts, options) => this.callAPI(texts, options),
    });

    this.maxTokens = COHERE_TEXT_EMBEDDING_MODELS[this.modelName].maxTokens;

    this.tokenizer = new CohereTokenizer({
      baseUrl: this.settings.baseUrl,
      apiKey: this.settings.apiKey,
      model: this.settings.model,
      retry: this.settings.tokenizerSettings?.retry,
      throttle: this.settings.tokenizerSettings?.throttle,
    });

    this.embeddingDimensions =
      COHERE_TEXT_EMBEDDING_MODELS[this.modelName].embeddingDimensions;
  }

  readonly provider = "cohere" as const;
  get modelName() {
    return this.settings.model;
  }

  protected readonly maxTextsPerCall = 96;
  readonly embeddingDimensions: number;

  readonly maxTokens: number;
  readonly tokenizer: Tokenizer;

  private get apiKey() {
    const apiKey = this.settings.apiKey ?? process.env.COHERE_API_KEY;

    if (apiKey == null) {
      throw new Error(
        "No Cohere API key provided. Pass an API key to the constructor or set the COHERE_API_KEY environment variable."
      );
    }

    return apiKey;
  }

  async countTokens(input: string) {
    return this.tokenizer.countTokens(input);
  }

  async callAPI(
    texts: Array<string>,
    options?: FunctionOptions<CohereTextEmbeddingModelSettings>
  ): Promise<CohereTextEmbeddingResponse> {
    if (texts.length > this.maxTextsPerCall) {
      throw new Error(
        `The Cohere embedding API only supports ${this.maxTextsPerCall} texts per API call.`
      );
    }

    const run = options?.run;
    const settings = options?.settings;

    const callSettings = Object.assign(
      {
        apiKey: this.apiKey,
      },
      this.settings,
      settings,
      {
        abortSignal: run?.abortSignal,
        texts,
      }
    );

    return callWithRetryAndThrottle({
      retry: this.settings.retry,
      throttle: this.settings.throttle,
      call: async () => callCohereEmbeddingAPI(callSettings),
    });
  }

  withSettings(additionalSettings: Partial<CohereTextEmbeddingModelSettings>) {
    return new CohereTextEmbeddingModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const cohereTextEmbeddingResponseSchema = z.object({
  id: z.string(),
  texts: z.array(z.string()),
  embeddings: z.array(z.array(z.number())),
  meta: z.object({
    api_version: z.object({
      version: z.string(),
    }),
  }),
});

export type CohereTextEmbeddingResponse = z.infer<
  typeof cohereTextEmbeddingResponseSchema
>;

/**
 * Call the Cohere Co.Embed API to generate an embedding for the given input.
 *
 * @see https://docs.cohere.com/reference/embed
 *
 * @example
 * const response = await callCohereEmbeddingAPI({
 *   apiKey: COHERE_API_KEY,
 *   model: "embed-english-light-v2.0",
 *   texts: [
 *     "At first, Nox didn't know what to do with the pup.",
 *     "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
 *   ],
 * });
 */
async function callCohereEmbeddingAPI({
  baseUrl = "https://api.cohere.ai/v1",
  abortSignal,
  apiKey,
  model,
  texts,
  truncate,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
  model: CohereTextEmbeddingModelType;
  texts: string[];
  truncate?: "NONE" | "START" | "END";
}): Promise<CohereTextEmbeddingResponse> {
  return postJsonToApi({
    url: `${baseUrl}/embed`,
    apiKey,
    body: {
      model,
      texts,
      truncate,
    },
    failedResponseHandler: failedCohereCallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      cohereTextEmbeddingResponseSchema
    ),
    abortSignal,
  });
}
