import { FunctionOptions } from "../../core/FunctionOptions.js";
import { StructureDefinition } from "../../core/structure/StructureDefinition.js";
import { Delta } from "../../model-function/Delta.js";
import { Model, ModelSettings } from "../Model.js";

export interface StructureGenerationModelSettings extends ModelSettings {}

export interface StructureGenerationModel<
  PROMPT,
  SETTINGS extends StructureGenerationModelSettings,
> extends Model<SETTINGS> {
  doGenerateStructure(
    structure: StructureDefinition<string, unknown>,
    prompt: PROMPT,
    options?: FunctionOptions
  ): PromiseLike<{
    response: unknown;
    structure: unknown;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }>;

  /**
   * Optional. Implement for streaming support.
   */
  readonly doStreamStructure?: (
    structureDefinition: StructureDefinition<string, unknown>,
    prompt: PROMPT,
    options?: FunctionOptions
  ) => PromiseLike<AsyncIterable<Delta<unknown>>>;
}
