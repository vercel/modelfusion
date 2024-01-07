import { FunctionCallOptions } from "../../core/FunctionOptions.js";
import { Vector } from "../../core/Vector.js";
import { Model, ModelSettings } from "../Model.js";

export interface EmbeddingModelSettings extends ModelSettings {}

export interface EmbeddingModel<
  VALUE,
  SETTINGS extends EmbeddingModelSettings = EmbeddingModelSettings,
> extends Model<SETTINGS> {
  /**
   * The size of the embedding vector.
   */
  readonly embeddingDimensions: number | undefined;

  /**
   * Limit of how many values can be sent in a single API call.
   */
  readonly maxValuesPerCall: number | undefined;

  /**
   * True if the model can handle multiple embedding calls in parallel.
   */
  readonly isParallelizable: boolean;

  doEmbedValues(
    values: VALUE[],
    options: FunctionCallOptions
  ): PromiseLike<{
    rawResponse: unknown;
    embeddings: Vector[];
  }>;
}
