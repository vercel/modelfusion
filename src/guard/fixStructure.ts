import { StructureParseError } from "../model-function/generate-structure/StructureParseError.js";
import { StructureValidationError } from "../model-function/generate-structure/StructureValidationError.js";
import { Guard } from "./guard.js";

export const fixStructure: <INPUT, OUTPUT>(options: {
  modifyInputForRetry: (options: {
    type: "error";
    input: INPUT;
    error: StructureValidationError | StructureParseError;
  }) => PromiseLike<INPUT>;
}) => Guard<INPUT, OUTPUT> =
  ({ modifyInputForRetry }) =>
  async (result) => {
    if (
      result.type === "error" &&
      (result.error instanceof StructureValidationError ||
        result.error instanceof StructureParseError)
    ) {
      return {
        action: "retry",
        input: await modifyInputForRetry({
          type: "error",
          input: result.input,
          error: result.error,
        }),
      };
    }

    return undefined;
  };
