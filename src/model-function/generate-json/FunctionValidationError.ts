import { getErrorMessage } from "../../util/getErrorMessage.js";

export class FunctionValidationError extends Error {
  readonly functionName: string;
  readonly cause: unknown;
  readonly value: unknown;

  constructor({
    functionName,
    value,
    cause,
  }: {
    functionName: string;
    value: unknown;
    cause: unknown;
  }) {
    super(
      `Function structure validation error for '${functionName}'. ` +
        `Value: ${JSON.stringify(value)}.\n` +
        `Error message: ${getErrorMessage(cause)}`
    );

    this.name = "FunctionValidationError";

    this.functionName = functionName;
    this.cause = cause;
    this.value = value;
  }
}
