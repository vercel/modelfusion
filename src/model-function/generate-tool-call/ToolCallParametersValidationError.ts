import { getErrorMessage } from "../../util/getErrorMessage.js";

export class ToolCallParametersValidationError extends Error {
  readonly toolName: string;
  readonly cause: unknown;
  readonly parameters: unknown;

  constructor({
    toolName,
    parameters,
    cause,
  }: {
    toolName: string;
    parameters: unknown;
    cause: unknown;
  }) {
    super(
      `Parameter validation failed for tool '${toolName}'. ` +
        `Value: ${JSON.stringify(parameters)}.\n` +
        `Error message: ${getErrorMessage(cause)}`
    );

    this.name = "ToolCallParametersValidationError";

    this.toolName = toolName;
    this.cause = cause;
    this.parameters = parameters;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause,
      stack: this.stack,

      toolName: this.toolName,
      parameter: this.parameters,
    };
  }
}
