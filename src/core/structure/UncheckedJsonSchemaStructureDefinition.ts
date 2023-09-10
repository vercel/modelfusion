import { Schema } from "./Schema.js";
import { StructureDefinition } from "./StructureDefinition.js";
import { UncheckedJsonSchemaSchema } from "./UncheckedJsonSchemaSchema.js";

export class UncheckedJsonSchemaStructureDefinition<
  NAME extends string,
  STRUCTURE,
> implements StructureDefinition<NAME, STRUCTURE>
{
  name: NAME;
  description?: string;
  schema: Schema<STRUCTURE>;

  constructor({
    name,
    description,
    jsonSchema,
  }: {
    name: NAME;
    description?: string;
    jsonSchema: unknown;
  }) {
    this.name = name;
    this.description = description;
    this.schema = new UncheckedJsonSchemaSchema(jsonSchema);
  }
}
