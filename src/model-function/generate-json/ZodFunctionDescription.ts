import { z } from "zod";
import { FunctionDescription } from "./FunctionDescription.js";
import { Schema } from "./Schema.js";
import { ZodSchema } from "./ZodSchema.js";

export class ZodFunctionDescription<NAME extends string, STRUCTURE>
  implements FunctionDescription<NAME, STRUCTURE>
{
  name: NAME;
  description?: string;
  parameters: Schema<STRUCTURE>;

  constructor({
    name,
    description,
    parameters,
  }: {
    name: NAME;
    description?: string;
    parameters: z.Schema<STRUCTURE>;
  }) {
    this.name = name;
    this.description = description;
    this.parameters = new ZodSchema(parameters);
  }
}
