import { EmbeddingModel } from "../../../text/embed/EmbeddingModel.js";
import { TokenizerModel } from "../../../text/tokenize/TokenizerModel.js";
import { getTiktokenTokenizerForModel } from "../tokenizer/tiktoken.js";
import { OpenAIEmbedding } from "./OpenAIEmbedding.js";
import { generateOpenAIEmbedding } from "./generateOpenAIEmbedding.js";

export const OPENAI_EMBEDDING_MODELS = {
  "text-embedding-ada-002": {
    maxTokens: 8192,
  },
};

export type OpenAIEmbeddingModelType = keyof typeof OPENAI_EMBEDDING_MODELS;

export type OpenAIEmbeddingModelSettings = {
  isUserIdForwardingEnabled?: boolean;
};

export type OpenAIEmbeddingModel = EmbeddingModel<OpenAIEmbedding, number[]> &
  TokenizerModel<number[]> & {
    readonly maxTokens: number;
    readonly countInputTokens: (input: string) => PromiseLike<number>;

    readonly withSettings: (
      settings: OpenAIEmbeddingModelSettings
    ) => OpenAIEmbeddingModel;
  };

/**
 * Create an embedding model that calls the OpenAI embedding API.
 *
 * @see https://platform.openai.com/docs/api-reference/embeddings
 *
 * @example
 * const textModel = createOpenAIEmbeddingModel({
 *   apiKey: OPENAI_API_KEY,
 *   model: "text-embedding-ada-002",
 * });
 *
 * const response = await textModel.embed(
 *   "At first, Nox didn't know what to do with the pup."
 * );
 *
 * const embedding = await textModel.extractEmbedding(response);
 */
export const createOpenAIEmbeddingModel = ({
  baseUrl,
  apiKey,
  model,
  settings = {},
}: {
  baseUrl?: string;
  apiKey: string;
  model: OpenAIEmbeddingModelType;
  settings?: OpenAIEmbeddingModelSettings;
}): OpenAIEmbeddingModel => {
  const tokenizer = getTiktokenTokenizerForModel({ model });

  return {
    vendor: "openai",
    model,

    tokenizer,
    maxTokens: OPENAI_EMBEDDING_MODELS[model].maxTokens,
    countInputTokens: (input: string) => tokenizer.countTokens(input),

    embed: async (input: string, context): Promise<OpenAIEmbedding> =>
      generateOpenAIEmbedding({
        baseUrl,
        abortSignal: context?.abortSignal,
        apiKey,
        input,
        model,
        user: settings.isUserIdForwardingEnabled ? context?.userId : undefined,
      }),

    extractEmbedding: async (rawOutput: OpenAIEmbedding): Promise<number[]> =>
      rawOutput.data[0]!.embedding,

    withSettings: (additionalSettings: OpenAIEmbeddingModelSettings) =>
      createOpenAIEmbeddingModel({
        baseUrl,
        apiKey,
        model,
        settings: Object.assign({}, settings, additionalSettings),
      }),
  };
};
