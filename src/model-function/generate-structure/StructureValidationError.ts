import { getErrorMessage } from "../../util/getErrorMessage.js";

export class StructureValidationError extends Error {
  readonly structureName: string;
  readonly cause: unknown;
  readonly valueText: string;
  readonly value: unknown;

  constructor({
    structureName,
    value,
    valueText,
    cause,
  }: {
    structureName: string;
    value: unknown;
    valueText: string;
    cause: unknown;
  }) {
    super(
      `Structure validation failed for '${structureName}'. ` +
        `Value: ${valueText}.\n` +
        `Error message: ${getErrorMessage(cause)}`
    );

    this.name = "StructureValidationError";

    this.structureName = structureName;
    this.cause = cause;
    this.value = value;
    this.valueText = valueText;
  }
}
