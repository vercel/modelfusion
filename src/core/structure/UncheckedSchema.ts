import { Schema } from "./Schema.js";

export class UncheckedSchema<STRUCTURE> implements Schema<STRUCTURE> {
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
