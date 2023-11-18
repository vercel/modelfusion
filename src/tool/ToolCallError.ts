import { getErrorMessage } from "../util/getErrorMessage";
import { ToolCall } from "./ToolCall";

export class ToolCallError extends Error {
  readonly toolCall: ToolCall<string, unknown>;
  readonly cause: unknown;

  constructor({
    cause,
    toolCall,
    message = getErrorMessage(cause),
  }: {
    toolCall: ToolCall<string, unknown>;
    cause: unknown | undefined;
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
