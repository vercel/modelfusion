import { Model, ModelSettings } from "../Model.js";
import { RunContext } from "../../run/RunContext.js";
import { Vector } from "../../run/Vector.js";

export interface TextEmbeddingModelSettings extends ModelSettings {}

export interface TextEmbeddingModel<SETTINGS extends TextEmbeddingModelSettings>
  extends Model<SETTINGS> {
  /**
   * The limit of tokens for a single text.
   */
  readonly maxTokens: number;

  /**
   * The size of the embedding vector.
   */
  readonly embeddingDimensions: number;

  embedText(
    text: string,
    settings?: Partial<SETTINGS> & {
      functionId?: string;
    },
    run?: RunContext
  ): PromiseLike<Vector>;
  embedText(
    text: string,
    settings:
      | (Partial<SETTINGS> & {
          functionId?: string;
        })
      | null, // require explicit null when run is set
    run: RunContext
  ): PromiseLike<Vector>;

  embedTexts(
    texts: string[],
    settings?: Partial<SETTINGS> & {
      functionId?: string;
    },
    run?: RunContext
  ): PromiseLike<Vector[]>;
  embedTexts(
    texts: string[],
    settings:
      | (Partial<SETTINGS> & {
          functionId?: string;
        })
      | null, // require explicit null when run is set
    run: RunContext
  ): PromiseLike<Vector[]>;
}
