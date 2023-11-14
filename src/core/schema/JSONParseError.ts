import { getErrorMessage } from "../../util/getErrorMessage.js";

export class JSONParseError extends Error {
  readonly structureName: string;
  readonly cause: unknown;
  readonly text: string;

  constructor({ text, cause }: { text: string; cause: unknown }) {
    super(
      `JSON parsing failed: ` +
        `Text: ${text}.\n` +
        `Error message: ${getErrorMessage(cause)}`
    );

    this.name = "JSONParseError";

    this.cause = cause;
    this.text = text;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause,
      valueText: this.text,
      stack: this.stack,
    };
  }
}
