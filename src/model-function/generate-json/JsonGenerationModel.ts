import { FunctionOptions } from "../FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface JsonGenerationModelSettings extends ModelSettings {}

export interface JsonGenerationPrompt<RESPONSE, T> {
  extractJson(response: RESPONSE): T;
}

export interface JsonGenerationModel<
  PROMPT,
  RESPONSE,
  SETTINGS extends JsonGenerationModelSettings
> extends Model<SETTINGS> {
  generateJsonForSchemaResponse<STRUCTURE>(
    prompt: PROMPT & JsonGenerationPrompt<RESPONSE, STRUCTURE>,
    options?: FunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE>;
}
