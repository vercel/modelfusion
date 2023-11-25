import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { JsonSchemaProducer } from "./JsonSchemaProducer.js";
import { Schema } from "./Schema.js";

export function zodSchema<STRUCTURE>(zodSchema: z.Schema<STRUCTURE>) {
  return new ZodSchema(zodSchema);
}

export class ZodSchema<STRUCTURE>
  implements Schema<STRUCTURE>, JsonSchemaProducer
{
  readonly zodSchema: z.Schema<STRUCTURE>;

  constructor(zodSchema: z.Schema<STRUCTURE>) {
    this.zodSchema = zodSchema;
  }

  validate(
    data: unknown
  ): { success: true; data: STRUCTURE } | { success: false; error: unknown } {
    return this.zodSchema.safeParse(data);
  }

  getJsonSchema(): unknown {
    return zodToJsonSchema(this.zodSchema);
  }

  readonly _type: STRUCTURE;
}
