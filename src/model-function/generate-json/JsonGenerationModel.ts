import { FunctionOptions } from "../FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface JsonGenerationModelSettings extends ModelSettings {}

export interface JsonGenerationPrompt<RESPONSE> {
  extractJson(response: RESPONSE): {
    fnName: string | null;
    json: unknown;
  };
}

export interface JsonGenerationModel<
  PROMPT,
  RESPONSE,
  SETTINGS extends JsonGenerationModelSettings
> extends Model<SETTINGS> {
  generateJsonResponse(
    prompt: PROMPT & JsonGenerationPrompt<RESPONSE>,
    options?: FunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE>;
}
