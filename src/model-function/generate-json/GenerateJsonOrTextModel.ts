import { FunctionOptions } from "../FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface GenerateJsonOrTextModelSettings extends ModelSettings {}

export interface GenerateJsonOrTextPrompt<RESPONSE> {
  extractJson(response: RESPONSE): {
    fnName: string | null;
    json: unknown;
  };
}

export interface GenerateJsonOrTextModel<
  PROMPT,
  RESPONSE,
  SETTINGS extends GenerateJsonOrTextModelSettings
> extends Model<SETTINGS> {
  generateJsonResponse(
    prompt: PROMPT & GenerateJsonOrTextPrompt<RESPONSE>,
    options?: FunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE>;
}
