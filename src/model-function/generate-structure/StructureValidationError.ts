import { getErrorMessage } from "../../util/getErrorMessage.js";

export class StructureValidationError extends Error {
  readonly cause: unknown;
  readonly valueText: string;
  readonly value: unknown;

  constructor({
    value,
    valueText,
    cause,
  }: {
    value: unknown;
    valueText: string;
    cause: unknown;
  }) {
    super(
      `Structure validation failed. ` +
        `Value: ${valueText}.\n` +
        `Error message: ${getErrorMessage(cause)}`
    );

    this.name = "StructureValidationError";

    this.cause = cause;
    this.value = value;
    this.valueText = valueText;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause,
      stack: this.stack,

      value: this.value,
      valueText: this.valueText,
    };
  }
}
