import { TextEmbeddingModel } from "../../../text/embed/TextEmbeddingModel.js";
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

export type OpenAITextEmbeddingModel = TextEmbeddingModel<
  OpenAIEmbedding,
  number[]
> &
  TokenizerModel<number[]> & {
    readonly maxTokens: number;
    readonly countInputTokens: (input: string) => PromiseLike<number>;

    readonly withSettings: (
      settings: OpenAITextEmbeddingModelSettings
    ) => OpenAITextEmbeddingModel;
  };

/**
 * Create a text embedding model that calls the OpenAI embedding API.
 *
 * @see https://platform.openai.com/docs/api-reference/embeddings
 *
 * @example
 * const embeddingModel = createOpenAITextEmbeddingModel({
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
export const createOpenAITextEmbeddingModel = ({
  baseUrl,
  apiKey,
  model,
  settings = {},
}: {
  baseUrl?: string;
  apiKey: string;
  model: OpenAITextEmbeddingModelType;
  settings?: OpenAITextEmbeddingModelSettings;
}): OpenAITextEmbeddingModel => {
  const tokenizer = getTiktokenTokenizerForModel({ model });

  return {
    provider: "openai",
    model,

    tokenizer,
    maxTokens: OPENAI_TEXT_EMBEDDING_MODELS[model].maxTokens,
    countInputTokens: (input: string) => tokenizer.countTokens(input),

    maxTextsPerCall: 1,
    embed: async (texts: Array<string>, context): Promise<OpenAIEmbedding> => {
      if (texts.length > 1) {
        throw new Error(
          `OpenAI embedding model "${model}" only supports one text per call`
        );
      }

      return generateOpenAIEmbedding({
        baseUrl,
        abortSignal: context?.abortSignal,
        apiKey,
        input: texts[0],
        model,
        user: settings.isUserIdForwardingEnabled ? context?.userId : undefined,
      });
    },
    extractEmbeddings: async (
      rawOutput: OpenAIEmbedding
    ): Promise<Array<number[]>> => [rawOutput.data[0]!.embedding],

    withSettings: (additionalSettings: OpenAITextEmbeddingModelSettings) =>
      createOpenAITextEmbeddingModel({
        baseUrl,
        apiKey,
        model,
        settings: Object.assign({}, settings, additionalSettings),
      }),
  };
};
