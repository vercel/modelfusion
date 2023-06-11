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

  /**
   * Generate an embedding for a single text.
   *
   * @example
   * const model = new OpenAITextEmbeddingModel(...);
   *
   * const embedding = await model.embedText(
   *   "At first, Nox didn't know what to do with the pup."
   * );
   */
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

  /**
   * Generate embeddings for multiple texts.
   *
   * @example
   * const model = new OpenAITextEmbeddingModel(...);
   *
   * const embeddings = await model.embedTexts([
   *   "At first, Nox didn't know what to do with the pup.",
   *   "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
   * ]);
   */
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
