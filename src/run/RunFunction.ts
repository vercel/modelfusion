import { RunContext } from "./RunContext.js";

/**
 * Standardized function signature for functions that are part of a run.
 *
 * This enables wrapping and chaining of run functions.
 */
export type RunFunction<INPUT, OUTPUT> = (
  input: INPUT,
  context?: RunContext
) => PromiseLike<OUTPUT>;
