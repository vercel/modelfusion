import { EmbeddingModel } from "../../model-function/embed/EmbeddingModel.js";
import { countTokens } from "../../model-function/tokenize-text/countTokens.js";
import {
  AbstractOpenAITextEmbeddingModel,
  AbstractOpenAITextEmbeddingModelSettings,
  OpenAITextEmbeddingResponse,
} from "./AbstractOpenAITextEmbeddingModel.js";
import { TikTokenTokenizer } from "./TikTokenTokenizer.js";

export const OPENAI_TEXT_EMBEDDING_MODELS = {
  "text-embedding-ada-002": {
    contextWindowSize: 8192,
    embeddingDimensions: 1536,
    tokenCostInMillicents: 0.01,
  },
};

export type OpenAITextEmbeddingModelType =
  keyof typeof OPENAI_TEXT_EMBEDDING_MODELS;

export const isOpenAIEmbeddingModel = (
  model: string
): model is OpenAITextEmbeddingModelType =>
  model in OPENAI_TEXT_EMBEDDING_MODELS;

export const calculateOpenAIEmbeddingCostInMillicents = ({
  model,
  responses,
}: {
  model: OpenAITextEmbeddingModelType;
  responses: OpenAITextEmbeddingResponse[];
}): number => {
  let amountInMilliseconds = 0;

  for (const response of responses) {
    amountInMilliseconds +=
      response.usage!.total_tokens *
      OPENAI_TEXT_EMBEDDING_MODELS[model].tokenCostInMillicents;
  }

  return amountInMilliseconds;
};

export interface OpenAITextEmbeddingModelSettings
  extends AbstractOpenAITextEmbeddingModelSettings {
  model: OpenAITextEmbeddingModelType;
}

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

    this.embeddingDimensions =
      OPENAI_TEXT_EMBEDDING_MODELS[this.modelName].embeddingDimensions;
  }

  readonly provider = "openai" as const;
  get modelName() {
    return this.settings.model;
  }

  readonly embeddingDimensions: number;

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
