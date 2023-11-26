import { JsonSchemaProducer } from "./JsonSchemaProducer.js";
import { Schema } from "./Schema.js";

export function uncheckedSchema<STRUCTURE>(jsonSchema?: unknown) {
  return new UncheckedSchema<STRUCTURE>(jsonSchema);
}

export class UncheckedSchema<STRUCTURE>
  implements Schema<STRUCTURE>, JsonSchemaProducer
{
  constructor(private readonly jsonSchema?: unknown) {}

  validate(
    data: unknown
  ): { success: true; data: STRUCTURE } | { success: false; error: unknown } {
    return { success: true, data: data as STRUCTURE };
  }

  getJsonSchema(): unknown {
    return this.jsonSchema;
  }

  readonly _type: STRUCTURE;
}
