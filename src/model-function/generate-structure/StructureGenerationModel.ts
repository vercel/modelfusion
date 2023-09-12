import { StructureDefinition } from "../../core/structure/StructureDefinition.js";
import { Model, ModelSettings } from "../Model.js";
import { ModelFunctionOptions } from "../ModelFunctionOptions.js";

export interface StructureGenerationModelSettings extends ModelSettings {}

export interface StructureGenerationModel<
  PROMPT,
  RESPONSE,
  SETTINGS extends StructureGenerationModelSettings,
> extends Model<SETTINGS> {
  generateStructureResponse(
    structure: StructureDefinition<string, unknown>,
    prompt: PROMPT,
    options?: ModelFunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE>;

  extractStructure(response: RESPONSE): unknown;

  extractUsage?(response: RESPONSE): {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
