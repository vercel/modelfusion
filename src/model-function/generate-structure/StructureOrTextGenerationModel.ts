import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface StructureOrTextGenerationModelSettings extends ModelSettings {}

export interface StructureOrTextGenerationPrompt<RESPONSE> {
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
}

export interface StructureOrTextGenerationModel<
  PROMPT,
  RESPONSE,
  SETTINGS extends StructureOrTextGenerationModelSettings,
> extends Model<SETTINGS> {
  generateStructureResponse(
    prompt: PROMPT & StructureOrTextGenerationPrompt<RESPONSE>,
    options?: ModelFunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE>;

  extractUsage?(response: RESPONSE): {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
