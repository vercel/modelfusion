import { Vector } from "../../core/Vector.js";
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

  /**
   * Limit of how many texts can be sent in a single API call.
   */
  readonly maxTextsPerCall: number | undefined;

  generateEmbeddingResponse(
    texts: string[],
    options?: ModelFunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE>;

  extractEmbeddings(response: RESPONSE): Vector[];
}
