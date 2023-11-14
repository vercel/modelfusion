import { StructureDefinition } from "./StructureDefinition.js";
import { UncheckedSchema } from "./UncheckedSchema.js";

export class UncheckedStructureDefinition<NAME extends string, STRUCTURE>
  implements StructureDefinition<NAME, STRUCTURE>
{
  name: NAME;
  description?: string;
  schema: UncheckedSchema<STRUCTURE>;

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
    this.schema = new UncheckedSchema(jsonSchema);
  }
}
