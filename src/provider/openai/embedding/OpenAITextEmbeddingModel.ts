import { RunContext } from "../../../run/RunContext.js";
import { TextEmbeddingModel } from "../../../text/embed/TextEmbeddingModel.js";
import { Tokenizer } from "../../../text/tokenize/Tokenizer.js";
import { TokenizerModel } from "../../../text/tokenize/TokenizerModel.js";
import { getTiktokenTokenizerForModel } from "../tokenizer/tiktoken.js";
import { OpenAIEmbedding } from "./OpenAIEmbedding.js";
import { generateOpenAIEmbedding } from "./generateOpenAIEmbedding.js";

export const OPENAI_TEXT_EMBEDDING_MODELS = {
  "text-embedding-ada-002": {
    maxTokens: 8192,
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
    TextEmbeddingModel<OpenAIEmbedding, number[]>,
    TokenizerModel<number[]>
{
  readonly provider = "openai";

  readonly baseUrl?: string;
  readonly apiKey: string;

  readonly model: OpenAITextEmbeddingModelType;
  readonly settings: OpenAITextEmbeddingModelSettings;

  readonly tokenizer: Tokenizer<number[]>;

  readonly maxTextsPerCall: 1;

  constructor({
    baseUrl,
    apiKey,
    model,
    settings = {},
  }: {
    baseUrl?: string;
    apiKey: string;
    model: OpenAITextEmbeddingModelType;
    settings?: OpenAITextEmbeddingModelSettings;
  }) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.model = model;
    this.settings = settings;

    this.tokenizer = getTiktokenTokenizerForModel({ model });
  }

  async embed(
    texts: Array<string>,
    context?: RunContext
  ): Promise<OpenAIEmbedding> {
    if (texts.length > 1) {
      throw new Error(
        "The OpenAI embedding API only supports one text per call"
      );
    }

    return generateOpenAIEmbedding({
      baseUrl: this.baseUrl,
      abortSignal: context?.abortSignal,
      apiKey: this.apiKey,
      input: texts[0],
      model: this.model,
      user: this.settings.isUserIdForwardingEnabled
        ? context?.userId
        : undefined,
    });
  }

  async extractEmbeddings(
    rawOutput: OpenAIEmbedding
  ): Promise<Array<number[]>> {
    return [rawOutput.data[0]!.embedding];
  }

  withSettings(additionalSettings: OpenAITextEmbeddingModelSettings) {
    return new OpenAITextEmbeddingModel({
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      model: this.model,
      settings: Object.assign({}, this.settings, additionalSettings),
    });
  }
}
