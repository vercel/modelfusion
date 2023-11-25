import { StructureParseError } from "../model-function/generate-structure/StructureParseError.js";
import { StructureValidationError } from "../model-function/generate-structure/StructureValidationError.js";
import { Guard } from "./guard.js";

/**
 * Attempts to correct and retry structure generation when encountering parsing or validation errors.
 *
 * This function acts as a guard within the structure generation process. If the generation results in
 * an error, identified as either a `StructureParseError` or `StructureValidationError`, the function
 * triggers a retry mechanism. It uses the `modifyInputForRetry` method, provided via options, to adjust
 * the input parameters, aiming to resolve the issue that caused the initial error. The process continues
 * until a valid structure is generated, or it exhausts the predefined retry limits.
 *
 * @template INPUT - The expected format/type of the input data used for structure generation.
 * @template OUTPUT - The expected format/type of the output data, i.e., the successfully generated structure.
 *
 * @param {Object} options - Configuration options for modifying the input before retrying structure generation.
 * @param {function} options.modifyInputForRetry - A function that takes the error type, original input, and error object.
 *        It modifies the input data based on the error information, aiming to correct the issue for the retry attempt.
 *        This function must return a promise that resolves with the modified input.
 *
 * @returns {Guard<INPUT, OUTPUT>} A guard function that intercepts the structure generation process, checking for
 *          errors, and initiating retries by modifying the input parameters. The guard can trigger multiple retries
 *          if the issues persist. If the process succeeds, it returns the valid structure; otherwise, it returns
 *          undefined, indicating the exhaustion of retry attempts or a non-recoverable error.
 *
 * @example
 * const result = await guard(
 *  (input) =>
 *    generateStructure(
 *      openai.ChatTextGenerator({
 *        // ...
 *      }),
 *      new ZodStructureDefinition({
 *        // ...
 *      }),
 *      input
 *    ),
 *  [
 *    // ...
 *  ],
 *  fixStructure({
 *    modifyInputForRetry: async ({ input, error }) => [
 *      ...input,
 *      OpenAIChatMessage.functionCall(null, {
 *        name: error.structureName,
 *        arguments: error.valueText,
 *      }),
 *      OpenAIChatMessage.user(error.message),
 *      OpenAIChatMessage.user("Please fix the error and try again."),
 *    ],
 *  })
 * );
 */
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
