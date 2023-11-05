import { getErrorMessage } from "./getErrorMessage.js";

export class JSONParseError extends Error {
  readonly structureName: string;
  readonly cause: unknown;
  readonly valueText: string;

  constructor({ valueText, cause }: { valueText: string; cause: unknown }) {
    super(
      `JSON parsing failed: ` +
        `Value: ${valueText}.\n` +
        `Error message: ${getErrorMessage(cause)}`
    );

    this.name = "JSONParseError";

    this.cause = cause;
    this.valueText = valueText;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause,
      valueText: this.valueText,
    };
  }
}
