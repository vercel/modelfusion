import { FunctionOptions } from "./FunctionOptions.js";
import { executeFunctionCall } from "./executeFunctionCall.js";

export async function executeFunction<INPUT, OUTPUT>(
  fn: (input: INPUT, options?: FunctionOptions) => PromiseLike<OUTPUT>,
  input: INPUT,
  options?: FunctionOptions
): Promise<OUTPUT> {
  return executeFunctionCall({
    options,
    input,
    functionType: "execute-function",
    execute: async (options) =>
      fn(input, {
        // omit functionId
        logging: options?.logging,
        observers: options?.observers,
        run: options?.run,
        parentCallId: options?.parentCallId,
      }),
  });
}
