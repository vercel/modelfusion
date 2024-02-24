import z from "zod";
import { EmbeddingModel } from "../../model-function/embed/EmbeddingModel";
import { countTokens } from "../../model-function/tokenize-text/countTokens";
import {
  AbstractOpenAITextEmbeddingModel,
  AbstractOpenAITextEmbeddingModelSettings,
} from "./AbstractOpenAITextEmbeddingModel";
import { TikTokenTokenizer } from "./TikTokenTokenizer";

export const OPENAI_TEXT_EMBEDDING_MODELS = {
  "text-embedding-3-small": {
    contextWindowSize: 8192,
    dimensions: 1536,
  },
  "text-embedding-3-large": {
    contextWindowSize: 8192,
    dimensions: 3072,
  },

  "text-embedding-ada-002": {
    contextWindowSize: 8192,
    dimensions: 1536,
  },
};

export type OpenAITextEmbeddingModelType =
  keyof typeof OPENAI_TEXT_EMBEDDING_MODELS;

export interface OpenAITextEmbeddingModelSettings
  extends AbstractOpenAITextEmbeddingModelSettings {
  model: OpenAITextEmbeddingModelType;
}

export const openAITextEmbeddingResponseSchema = z.object({
  object: z.literal("list"),
  data: z.array(
    z.object({
      object: z.literal("embedding"),
      embedding: z.array(z.number()),
      index: z.number(),
    })
  ),
  model: z.string(),
  usage: z
    .object({
      prompt_tokens: z.number(),
      total_tokens: z.number(),
    })
    .optional(), // for openai-compatible models
});

/**
 * Create a text embedding model that calls the OpenAI embedding API.
 *
 * @see https://platform.openai.com/docs/api-reference/embeddings
 *
 * @example
 * const embeddings = await embedMany(
 *   new OpenAITextEmbeddingModel({ model: "text-embedding-ada-002" }),
 *   [
 *     "At first, Nox didn't know what to do with the pup.",
 *     "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
 *   ]
 * );
 */
export class OpenAITextEmbeddingModel
  extends AbstractOpenAITextEmbeddingModel<OpenAITextEmbeddingModelSettings>
  implements EmbeddingModel<string, OpenAITextEmbeddingModelSettings>
{
  constructor(settings: OpenAITextEmbeddingModelSettings) {
    super(settings);

    this.tokenizer = new TikTokenTokenizer({ model: this.modelName });
    this.contextWindowSize =
      OPENAI_TEXT_EMBEDDING_MODELS[this.modelName].contextWindowSize;

    this.dimensions =
      this.settings.dimensions ??
      OPENAI_TEXT_EMBEDDING_MODELS[this.modelName].dimensions;
  }

  readonly provider = "openai" as const;
  get modelName() {
    return this.settings.model;
  }

  readonly dimensions: number;

  readonly tokenizer: TikTokenTokenizer;
  readonly contextWindowSize: number;

  async countTokens(input: string) {
    return countTokens(this.tokenizer, input);
  }

  get settingsForEvent(): Partial<OpenAITextEmbeddingModelSettings> {
    return {};
  }

  withSettings(additionalSettings: OpenAITextEmbeddingModelSettings) {
    return new OpenAITextEmbeddingModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}
