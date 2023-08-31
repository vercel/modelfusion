import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface JsonGenerationModelSettings extends ModelSettings {}

export interface JsonGenerationModel<
  PROMPT,
  RESPONSE,
  SETTINGS extends JsonGenerationModelSettings,
> extends Model<SETTINGS> {
  generateJsonResponse(
    prompt: PROMPT,
    options?: ModelFunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE>;

  extractJson(response: RESPONSE): unknown;

  extractUsage?(response: RESPONSE): {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
