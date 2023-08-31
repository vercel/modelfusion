import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface JsonOrTextGenerationModelSettings extends ModelSettings {}

export interface JsonOrTextGenerationPrompt<RESPONSE> {
  extractJsonAndText(response: RESPONSE):
    | {
        schema: null;
        value: null;
        text: string;
      }
    | {
        schema: string;
        value: unknown;
        text: string | null;
      };
}

export interface JsonOrTextGenerationModel<
  PROMPT,
  RESPONSE,
  SETTINGS extends JsonOrTextGenerationModelSettings,
> extends Model<SETTINGS> {
  generateJsonResponse(
    prompt: PROMPT & JsonOrTextGenerationPrompt<RESPONSE>,
    options?: ModelFunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE>;

  extractUsage?(response: RESPONSE): {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
