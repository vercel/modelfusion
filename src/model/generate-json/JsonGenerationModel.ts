import { z } from "zod";
import { FunctionOptions } from "../FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface JsonGenerationModelSettings extends ModelSettings {}

export type JsonGenerationSchema<T> = {
  name: string;
  description?: string;
  parameters: z.ZodSchema<T>;
};

export interface JsonGenerationModel<
  PROMPT,
  RESPONSE,
  SETTINGS extends JsonGenerationModelSettings
> extends Model<SETTINGS> {
  generateJsonResponse<T>(
    prompt: PROMPT,
    schema: JsonGenerationSchema<T>,
    options?: FunctionOptions<SETTINGS>
  ): PromiseLike<RESPONSE>;

  extractJson<T>(response: RESPONSE, schema: JsonGenerationSchema<T>): T;
}
