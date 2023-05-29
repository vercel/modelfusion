import { EmbeddingModel } from "../../../text/embed/EmbeddingModel.js";
import { TokenizerModel } from "../../../text/tokenize/TokenizerModel.js";
import { getTiktokenTokenizerForModel } from "../tiktoken.js";
import { OpenAIEmbedding } from "./OpenAIEmbedding.js";
import { generateOpenAIEmbedding } from "./generateOpenAIEmbedding.js";

export const OPENAI_EMBEDDING_MODELS = Object.freeze({
  "text-embedding-ada-002": Object.freeze({
    maxTokens: 8192,
  }),
});

export type OpenAIEmbeddingModelType = keyof typeof OPENAI_EMBEDDING_MODELS;

export type OpenAIEmbeddingModelSettings = {
  isUserIdForwardingEnabled?: boolean;
};

export type OpenAIEmbeddingModel = EmbeddingModel<OpenAIEmbedding, number[]> &
  TokenizerModel<number[]> & {
    readonly maxTokens: number;
    readonly withSettings: (
      settings: OpenAIEmbeddingModelSettings
    ) => OpenAIEmbeddingModel;
  };

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
