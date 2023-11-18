import { getErrorMessage } from "../util/getErrorMessage.js";

export class ToolCallGenerationError extends Error {
  readonly toolName: string;
  readonly cause: unknown;

  constructor({ toolName, cause }: { toolName: string; cause: unknown }) {
    super(
      `Tool call generation failed for tool '${toolName}'. ` +
        `Error message: ${getErrorMessage(cause)}`
    );

    this.name = "ToolCallsGenerationError";

    this.toolName = toolName;
    this.cause = cause;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause,
      stack: this.stack,

      toolName: this.toolName,
    };
  }
}
