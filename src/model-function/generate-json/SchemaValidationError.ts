import { z } from "zod";

export class SchemaValidationError extends Error {
  readonly schemaName: string;
  readonly errors: z.ZodError;
  readonly value: unknown;

  constructor({
    schemaName,
    value,
    errors,
  }: {
    schemaName: string;
    value: unknown;
    errors: z.ZodError;
  }) {
    super(
      `Schema validation error for '${schemaName}'. ` +
        `Value: ${JSON.stringify(value)}.\n` +
        `Error details: ${errors.message}\n` +
        `Error field(s): ${errors.errors
          .map((err) => err.path.join("."))
          .join(", ")}`
    );

    this.name = "SchemaValidationError";

    this.schemaName = schemaName;
    this.errors = errors;
    this.value = value;
  }
}
