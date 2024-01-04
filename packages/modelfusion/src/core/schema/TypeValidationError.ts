import { getErrorMessage } from "../../util/getErrorMessage.js";

export class TypeValidationError extends Error {
  readonly structure: unknown;
  readonly cause: unknown;

  constructor({ structure, cause }: { structure: unknown; cause: unknown }) {
    super(
      `Type validation failed: ` +
        `Structure: ${JSON.stringify(structure)}.\n` +
        `Error message: ${getErrorMessage(cause)}`
    );

    this.name = "TypeValidationError";

    this.cause = cause;
    this.structure = structure;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause,
      stack: this.stack,

      object: this.structure,
    };
  }
}
