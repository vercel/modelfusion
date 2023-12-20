import { getErrorMessage } from "../util/getErrorMessage.js";

/**
 * Thrown when the arguments of a tool call are invalid.
 *
 * This typically means they don't match the parameters schema that is expected the tool.
 */
export class ToolCallArgumentsValidationError extends Error {
  readonly toolName: string;
  readonly cause: unknown;
  readonly args: unknown;

  constructor({
    toolName,
    args,
    cause,
  }: {
    toolName: string;
    args: unknown;
    cause: unknown;
  }) {
    super(
      `Argument validation failed for tool '${toolName}'.\n` +
        `Arguments: ${JSON.stringify(args)}.\n` +
        `Error message: ${getErrorMessage(cause)}`
    );

    this.name = "ToolCallArgumentsValidationError";

    this.toolName = toolName;
    this.cause = cause;
    this.args = args;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause,
      stack: this.stack,

      toolName: this.toolName,
      args: this.args,
    };
  }
}
