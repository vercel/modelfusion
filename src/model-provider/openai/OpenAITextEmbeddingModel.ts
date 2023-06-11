import z from "zod";
import { AbstractTextEmbeddingModel } from "../../model/text-embedding/AbstractTextEmbeddingModel.js";
import { TextEmbeddingModelSettings } from "../../model/text-embedding/TextEmbeddingModel.js";
import { RunContext } from "../../run/RunContext.js";
import { TokenizationSupport } from "../../model/tokenization/TokenizationSupport.js";
import { Tokenizer } from "../../model/tokenization/Tokenizer.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { callWithRetryAndThrottle } from "../../util/api/callWithRetryAndThrottle.js";
import {
  createJsonResponseHandler,
  postJsonToApi,
} from "../../util/api/postToApi.js";
import { TikTokenTokenizer } from "./TikTokenTokenizer.js";
import { failedOpenAICallResponseHandler } from "./failedOpenAICallResponseHandler.js";

export const OPENAI_TEXT_EMBEDDING_MODELS = {
  "text-embedding-ada-002": {
    maxTokens: 8192,
    embeddingDimensions: 1536,
  },
};

export type OpenAITextEmbeddingModelType =
  keyof typeof OPENAI_TEXT_EMBEDDING_MODELS;

export interface OpenAITextEmbeddingModelSettings
  extends TextEmbeddingModelSettings {
  model: OpenAITextEmbeddingModelType;

  baseUrl?: string;
  apiKey?: string;

  retry?: RetryFunction;
  throttle?: ThrottleFunction;
  isUserIdForwardingEnabled?: boolean;
}

/**
 * Create a text embedding model that calls the OpenAI embedding API.
 *
 * @see https://platform.openai.com/docs/api-reference/embeddings
 *
 * @example
 * const model = new OpenAITextEmbeddingModel({
 *   model: "text-embedding-ada-002",
 * });
 *
 * const embeddings = await model.embedTexts([
 *   "At first, Nox didn't know what to do with the pup.",
 *   "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
 * ]);
 */
export class OpenAITextEmbeddingModel
  extends AbstractTextEmbeddingModel<
    OpenAITextEmbeddingResponse,
    OpenAITextEmbeddingModelSettings
  >
  implements TokenizationSupport
{
  constructor(settings: OpenAITextEmbeddingModelSettings) {
    super({
      settings,
      extractEmbeddings: (response) => [response.data[0]!.embedding],
      generateResponse: (texts, _, run) => this.callAPI(texts, run),
    });

    this.tokenizer = new TikTokenTokenizer({ model: this.modelName });
    this.maxTokens = OPENAI_TEXT_EMBEDDING_MODELS[this.modelName].maxTokens;

    this.embeddingDimensions =
      OPENAI_TEXT_EMBEDDING_MODELS[this.modelName].embeddingDimensions;
  }

  readonly provider = "openai" as const;
  get modelName() {
    return this.settings.model;
  }

  readonly maxTextsPerCall = 1;
  readonly embeddingDimensions: number;

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

  async countTokens(input: string) {
    return this.tokenizer.countTokens(input);
  }

  async callAPI(
    texts: Array<string>,
    context?: RunContext
  ): Promise<OpenAITextEmbeddingResponse> {
    if (texts.length > this.maxTextsPerCall) {
      throw new Error(
        `The OpenAI embedding API only supports ${this.maxTextsPerCall} texts per API call.`
      );
    }

    return callWithRetryAndThrottle({
      retry: this.settings.retry,
      throttle: this.settings.throttle,
      call: async () =>
        callOpenAITextEmbeddingAPI({
          abortSignal: context?.abortSignal,
          apiKey: this.apiKey,
          input: texts[0],
          model: this.modelName,
          user: this.settings.isUserIdForwardingEnabled
            ? context?.userId
            : undefined,
        }),
    });
  }

  withSettings(additionalSettings: OpenAITextEmbeddingModelSettings) {
    return new OpenAITextEmbeddingModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const openAITextEmbeddingResponseSchema = z.object({
  object: z.literal("list"),
  data: z
    .array(
      z.object({
        object: z.literal("embedding"),
        embedding: z.array(z.number()),
        index: z.number(),
      })
    )
    .length(1),
  model: z.string(),
  usage: z.object({
    prompt_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

export type OpenAITextEmbeddingResponse = z.infer<
  typeof openAITextEmbeddingResponseSchema
>;

/**
 * Call the OpenAI Embedding API to generate an embedding for the given input.
 *
 * @see https://platform.openai.com/docs/api-reference/embeddings
 *
 * @example
 * const response = await callOpenAITextEmbeddingAPI({
 *   apiKey: OPENAI_API_KEY,
 *   model: "text-embedding-ada-002",
 *   input: "At first, Nox didn't know what to do with the pup.",
 * });
 *
 * console.log(response.data[0].embedding);
 */
async function callOpenAITextEmbeddingAPI({
  baseUrl = "https://api.openai.com/v1",
  abortSignal,
  apiKey,
  model,
  input,
  user,
}: {
  baseUrl?: string;
  abortSignal?: AbortSignal;
  apiKey: string;
  model: OpenAITextEmbeddingModelType;
  input: string;
  user?: string;
}): Promise<OpenAITextEmbeddingResponse> {
  return postJsonToApi({
    url: `${baseUrl}/embeddings`,
    apiKey,
    body: {
      model,
      input,
      user,
    },
    failedResponseHandler: failedOpenAICallResponseHandler,
    successfulResponseHandler: createJsonResponseHandler(
      openAITextEmbeddingResponseSchema
    ),
    abortSignal,
  });
}
