import { Vector } from "../../run/Vector.js";
import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface TextEmbeddingModelSettings extends ModelSettings {}

export interface TextEmbeddingModel<
  RESPONSE,
  SETTINGS extends TextEmbeddingModelSettings,
> extends Model<SETTINGS> {
  /**
   * The limit of tokens for a single text.
   */
  readonly contextWindowSize: number | undefined;

  /**
   * The size of the embedding vector.
   */
  readonly embeddingDimensions: number | undefined;

  readonly maxTextsPerCall: number;

  generateEmbeddingResponse(
    texts: string[],
    options?: ModelFunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE>;

  extractEmbeddings(response: RESPONSE): Vector[];
}
