import { Run } from "./Run.js";

/**
 * Standardized function signature for functions that are part of a run.
 *
 * This enables wrapping and tracing of run functions.
 */
export type RunFunction<INPUT, OUTPUT> = (
  input: INPUT,
  options?: RunFunctionOptions
) => PromiseLike<OUTPUT>;

/**
 * Additional settings for run functions.
 */
export type RunFunctionOptions = {
  functionId?: string;
  run?: Run;
};
