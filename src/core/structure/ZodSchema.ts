import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Schema } from "./Schema.js";

export class ZodSchema<STRUCTURE> implements Schema<STRUCTURE> {
  readonly zodSchema: z.Schema<STRUCTURE>;

  constructor(zodSchema: z.Schema<STRUCTURE>) {
    this.zodSchema = zodSchema;
  }

  validate(
    value: unknown
  ): { success: true; value: STRUCTURE } | { success: false; error: unknown } {
    const parseResult = this.zodSchema.safeParse(value);
    return parseResult.success
      ? { success: true, value: parseResult.data }
      : parseResult;
  }

  getJsonSchema(): unknown {
    return zodToJsonSchema(this.zodSchema);
  }

  readonly _type: STRUCTURE;
}
