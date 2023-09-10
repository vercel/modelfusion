import { getErrorMessage } from "../../util/getErrorMessage.js";

export class StructureValidationError extends Error {
  readonly structureName: string;
  readonly cause: unknown;
  readonly value: unknown;

  constructor({
    structureName,
    value,
    cause,
  }: {
    structureName: string;
    value: unknown;
    cause: unknown;
  }) {
    super(
      `Structure validation error for '${structureName}'. ` +
        `Value: ${JSON.stringify(value)}.\n` +
        `Error message: ${getErrorMessage(cause)}`
    );

    this.name = "StructureValidationError";

    this.structureName = structureName;
    this.cause = cause;
    this.value = value;
  }
}
