import { Schema } from "./Schema.js";

export class UncheckedSchema<STRUCTURE> implements Schema<STRUCTURE> {
  constructor(private readonly jsonSchema?: unknown) {}

  validate(
    value: unknown
  ): { success: true; value: STRUCTURE } | { success: false; error: unknown } {
    return { success: true, value: value as STRUCTURE };
  }

  getJsonSchema(): unknown {
    return this.jsonSchema;
  }

  readonly _type: STRUCTURE;
}
