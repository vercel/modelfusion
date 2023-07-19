import { Vector } from "../../run/Vector.js";
import { FunctionOptions } from "../FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface TextEmbeddingModelSettings extends ModelSettings {}

export interface TextEmbeddingModel<
  RESPONSE,
  SETTINGS extends TextEmbeddingModelSettings
> extends Model<SETTINGS> {
  /**
   * The limit of tokens for a single text.
   */
  readonly maxTokens: number;

  /**
   * The size of the embedding vector.
   */
  readonly embeddingDimensions: number;

  readonly maxTextsPerCall: number;

  generateEmbeddingResponse(
    texts: string[],
    options?: FunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE>;

  extractEmbeddings(response: RESPONSE): Vector[];
}
