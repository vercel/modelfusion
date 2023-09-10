import { getErrorMessage } from "../../util/getErrorMessage.js";

export class SchemaValidationError extends Error {
  readonly schemaName: string;
  readonly cause: unknown;
  readonly value: unknown;

  constructor({
    schemaName,
    value,
    cause,
  }: {
    schemaName: string;
    value: unknown;
    cause: unknown;
  }) {
    super(
      `Schema validation error for '${schemaName}'. ` +
        `Value: ${JSON.stringify(value)}.\n` +
        `Error message: ${getErrorMessage(cause)}`
    );

    this.name = "SchemaValidationError";

    this.schemaName = schemaName;
    this.cause = cause;
    this.value = value;
  }
}
