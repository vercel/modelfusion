import { z } from "zod";
import { StructureDefinition } from "./StructureDefinition.js";
import { ZodSchema } from "./ZodSchema.js";

export class ZodStructureDefinition<NAME extends string, STRUCTURE>
  implements StructureDefinition<NAME, STRUCTURE>
{
  name: NAME;
  description?: string;
  schema: ZodSchema<STRUCTURE>;

  constructor({
    name,
    description,
    schema,
  }: {
    name: NAME;
    description?: string;
    schema: z.Schema<STRUCTURE> | ZodSchema<STRUCTURE>;
  }) {
    this.name = name;
    this.description = description;
    this.schema = schema instanceof ZodSchema ? schema : new ZodSchema(schema);
  }
}
