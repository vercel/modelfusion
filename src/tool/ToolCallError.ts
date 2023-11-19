import { getErrorMessage } from "../util/getErrorMessage.js";
import { ToolCall } from "./ToolCall.js";

export class ToolCallError extends Error {
  readonly toolCall: ToolCall<string, unknown>;
  readonly cause: unknown | undefined;

  constructor({
    cause,
    toolCall,
    message = getErrorMessage(cause),
  }: {
    toolCall: ToolCall<string, unknown>;
    cause?: unknown;
    message?: string;
  }) {
    super(`Tool call for tool '${toolCall.name}' failed: ${message}`);

    this.name = "ToolCallError";

    this.toolCall = toolCall;
    this.cause = cause;
  }

  toJSON() {
    return {
      name: this.name,
      cause: this.cause,
      message: this.message,
      stack: this.stack,

      toolCall: this.toolCall,
    };
  }
}
