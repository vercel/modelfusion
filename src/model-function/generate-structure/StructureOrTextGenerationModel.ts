import { FunctionOptions } from "../../core/FunctionOptions.js";
import { StructureDefinition } from "../../core/structure/StructureDefinition.js";
import { Model, ModelSettings } from "../Model.js";

export interface StructureOrTextGenerationModelSettings extends ModelSettings {}

export interface StructureOrTextGenerationModel<
  PROMPT,
  SETTINGS extends StructureOrTextGenerationModelSettings,
> extends Model<SETTINGS> {
  doGenerateStructureOrText(
    structureDefinitions: Array<StructureDefinition<string, unknown>>,
    prompt: PROMPT,
    options?: FunctionOptions
  ): PromiseLike<{
    response: unknown;
    structureAndText:
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
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }>;
}
