import { getErrorMessage } from "../../util/getErrorMessage.js";

export class StructureParseError extends Error {
  readonly cause: unknown;
  readonly valueText: string;

  constructor({ valueText, cause }: { valueText: string; cause: unknown }) {
    super(
      `Structure parsing failed. ` +
        `Value: ${valueText}.\n` +
        `Error message: ${getErrorMessage(cause)}`
    );

    this.name = "StructureParseError";

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
