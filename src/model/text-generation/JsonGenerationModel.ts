import { z } from "zod";
import { PromptTemplate } from "../../run/PromptTemplate.js";
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
  SETTINGS extends JsonGenerationModelSettings
> extends Model<SETTINGS> {
  generateJson<T>(
    prompt: PROMPT,
    schema: JsonGenerationSchema<T>,
    options?: FunctionOptions<SETTINGS>
  ): PromiseLike<T>;

  generateJsonAsFunction<INPUT, T>(
    promptTemplate: PromptTemplate<INPUT, PROMPT>,
    schema: JsonGenerationSchema<T>,
    options?: Omit<FunctionOptions<SETTINGS>, "run">
  ): (input: INPUT, options?: FunctionOptions<SETTINGS>) => PromiseLike<T>;
}
