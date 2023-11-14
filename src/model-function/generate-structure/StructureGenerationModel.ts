import { FunctionOptions } from "../../core/FunctionOptions.js";
import { StructureDefinition } from "../../core/schema/StructureDefinition.js";
import { Delta } from "../../model-function/Delta.js";
import { Model, ModelSettings } from "../Model.js";

export interface StructureGenerationModelSettings extends ModelSettings {}

export interface StructureGenerationModel<
  PROMPT,
  SETTINGS extends
    StructureGenerationModelSettings = StructureGenerationModelSettings,
> extends Model<SETTINGS> {
  doGenerateStructure(
    structure: StructureDefinition<string, unknown>,
    prompt: PROMPT,
    options?: FunctionOptions
  ): PromiseLike<{
    response: unknown;
    valueText: string;
    value: unknown;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }>;
}

export interface StructureStreamingModel<
  PROMPT,
  SETTINGS extends
    StructureGenerationModelSettings = StructureGenerationModelSettings,
> extends StructureGenerationModel<PROMPT, SETTINGS> {
  doStreamStructure(
    structureDefinition: StructureDefinition<string, unknown>,
    prompt: PROMPT,
    options?: FunctionOptions
  ): PromiseLike<AsyncIterable<Delta<unknown>>>;
}
