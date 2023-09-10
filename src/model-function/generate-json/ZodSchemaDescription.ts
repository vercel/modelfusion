import { z } from "zod";
import { SchemaDescription } from "./SchemaDescription.js";
import { Schema } from "./Schema.js";
import { ZodSchema } from "./ZodSchema.js";

export class ZodSchemaDescription<NAME extends string, STRUCTURE>
  implements SchemaDescription<NAME, STRUCTURE>
{
  name: NAME;
  description?: string;
  schema: Schema<STRUCTURE>;

  constructor({
    name,
    description,
    schema,
  }: {
    name: NAME;
    description?: string;
    schema: z.Schema<STRUCTURE>;
  }) {
    this.name = name;
    this.description = description;
    this.schema = new ZodSchema(schema);
  }
}
