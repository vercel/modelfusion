import { Vector } from "../../core/Vector.js";
import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface EmbeddingModelSettings extends ModelSettings {}

export interface EmbeddingModel<
  VALUE,
  RESPONSE,
  SETTINGS extends EmbeddingModelSettings,
> extends Model<SETTINGS> {
  /**
   * The size of the embedding vector.
   */
  readonly embeddingDimensions: number | undefined;

  /**
   * Limit of how many values can be sent in a single API call.
   */
  readonly maxValuesPerCall: number | undefined;

  generateEmbeddingResponse(
    values: VALUE[],
    options?: ModelFunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE>;

  extractEmbeddings(response: RESPONSE): Vector[];
}
