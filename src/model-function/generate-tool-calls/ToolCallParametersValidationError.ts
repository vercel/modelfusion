import { getErrorMessage } from "../../util/getErrorMessage.js";

export class ToolCallParametersValidationError extends Error {
  readonly toolName: string;
  readonly cause: unknown;
  readonly valueText: string;
  readonly parameters: unknown;

  constructor({
    toolName,
    parameters,
    valueText,
    cause,
  }: {
    toolName: string;
    parameters: unknown;
    valueText: string;
    cause: unknown;
  }) {
    super(
      `Parameter validation failed for tool '${toolName}'. ` +
        `Value: ${valueText}.\n` +
        `Error message: ${getErrorMessage(cause)}`
    );

    this.name = "ToolCallParametersValidationError";

    this.toolName = toolName;
    this.cause = cause;
    this.parameters = parameters;
    this.valueText = valueText;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause,
      stack: this.stack,

      toolName: this.toolName,
      parameter: this.parameters,
      valueText: this.valueText,
    };
  }
}
