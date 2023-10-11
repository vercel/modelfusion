import { StructureParseError } from "../model-function/generate-structure/StructureParseError.js";
import { StructureValidationError } from "../model-function/generate-structure/StructureValidationError.js";
import { Guard } from "./guard.js";

export const fixStructure: <INPUT, OUTPUT>(options: {
  modifyInputForRetry: (options: {
    type: "error";
    input: INPUT;
    error: StructureValidationError | StructureParseError;
  }) => PromiseLike<INPUT>;
}) => Guard<INPUT, OUTPUT> = ({ modifyInputForRetry }) => ({
  isValid: async (result) =>
    result.type !== "error" ||
    !(
      result.error instanceof StructureValidationError ||
      result.error instanceof StructureParseError
    ),
  whenInvalid: "retry",
  modifyInputForRetry: async (result) =>
    modifyInputForRetry({
      type: "error",
      input: result.input,
      error: result.error as StructureValidationError | StructureParseError,
    }),
});
