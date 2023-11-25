import { getErrorMessage } from "../../util/getErrorMessage.js";

export class ToolCallParseError extends Error {
  readonly toolName: string;
  readonly valueText: string;
  readonly cause: unknown;

  constructor({
    toolName,
    valueText,
    cause,
  }: {
    toolName: string;
    valueText: string;
    cause: unknown;
  }) {
    super(
      `Tool call parsing failed for '${toolName}'. ` +
        `Value: ${valueText}.\n` +
        `Error message: ${getErrorMessage(cause)}`
    );

    this.name = "ToolCallParseError";

    this.toolName = toolName;
    this.cause = cause;
    this.valueText = valueText;
  }

  toJSON() {
    return {
      name: this.name,
      cause: this.cause,
      message: this.message,
      stack: this.stack,

      toolName: this.toolName,
      valueText: this.valueText,
    };
  }
}
