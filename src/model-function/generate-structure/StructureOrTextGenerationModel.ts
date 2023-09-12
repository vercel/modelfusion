import { StructureDefinition } from "../../core/structure/StructureDefinition.js";
import { Model, ModelSettings } from "../Model.js";
import { ModelFunctionOptions } from "../ModelFunctionOptions.js";

export interface StructureOrTextGenerationModelSettings extends ModelSettings {}

export interface StructureOrTextGenerationModel<
  PROMPT,
  RESPONSE,
  SETTINGS extends StructureOrTextGenerationModelSettings,
> extends Model<SETTINGS> {
  generateStructureOrTextResponse(
    structureDefinitions: Array<StructureDefinition<string, unknown>>,
    prompt: PROMPT,
    options?: ModelFunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE>;

  extractStructureAndText(response: RESPONSE):
    | {
        structure: null;
        value: null;
        text: string;
      }
    | {
        structure: string;
        value: unknown;
        text: string | null;
      };

  extractUsage?(response: RESPONSE): {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
