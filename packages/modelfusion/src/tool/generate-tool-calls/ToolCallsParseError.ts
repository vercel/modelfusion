import { getErrorMessage } from "../../util/getErrorMessage.js";

export class ToolCallsParseError extends Error {
  readonly valueText: string;
  readonly cause: unknown;

  constructor({ valueText, cause }: { valueText: string; cause: unknown }) {
    super(
      `Tool calls parsing failed. ` +
        `Value: ${valueText}.\n` +
        `Error message: ${getErrorMessage(cause)}`
    );

    this.name = "ToolCallsParseError";

    this.cause = cause;
    this.valueText = valueText;
  }

  toJSON() {
    return {
      name: this.name,
      cause: this.cause,
      message: this.message,
      stack: this.stack,

      valueText: this.valueText,
    };
  }
}
