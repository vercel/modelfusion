import { getErrorMessage } from "../../util/getErrorMessage.js";

export class StructureParseError extends Error {
  readonly structureName: string;
  readonly cause: unknown;
  readonly valueText: string;

  constructor({
    structureName,
    valueText,
    cause,
  }: {
    structureName: string;
    valueText: string;
    cause: unknown;
  }) {
    super(
      `Structure parsing failed for '${structureName}'. ` +
        `Value: ${valueText}.\n` +
        `Error message: ${getErrorMessage(cause)}`
    );

    this.name = "StructureParseError";

    this.structureName = structureName;
    this.cause = cause;
    this.valueText = valueText;
  }
}
