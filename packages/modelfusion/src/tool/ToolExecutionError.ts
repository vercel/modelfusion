import { getErrorMessage } from "../util/getErrorMessage.js";

export class ToolExecutionError extends Error {
  readonly toolName: string;
  readonly input: unknown;
  readonly cause: unknown;

  constructor({
    toolName,
    input,
    cause,
    message = getErrorMessage(cause),
  }: {
    toolName: string;
    input: unknown;
    cause: unknown | undefined;
    message?: string;
  }) {
    super(`Error executing tool '${toolName}': ${message}`);

    this.name = "ToolExecutionError";

    this.toolName = toolName;
    this.input = input;
    this.cause = cause;
  }

  toJSON() {
    return {
      name: this.name,
      cause: this.cause,
      message: this.message,
      stack: this.stack,

      toolName: this.toolName,
      input: this.input,
    };
  }
}
