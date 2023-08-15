import { FunctionOptions } from "../FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface GenerateJsonModelSettings extends ModelSettings {}

export interface GenerateJsonModel<
  PROMPT,
  RESPONSE,
  SETTINGS extends GenerateJsonModelSettings,
> extends Model<SETTINGS> {
  generateJsonResponse(
    prompt: PROMPT,
    options?: FunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE>;

  extractJson(response: RESPONSE): unknown;
}
