import { SafeResult } from "../util/SafeResult.js";
import { Run } from "./Run.js";

/**
 * Standardized function signature for functions that are part of a run.
 *
 * This enables wrapping and chaining of run functions.
 */
export type RunFunction<INPUT, OUTPUT> = (
  input: INPUT,
  options?: {
    run?: Run;
  }
) => PromiseLike<OUTPUT>;

export type SafeRunFunction<INPUT, OUTPUT> = (
  input: INPUT,
  options?: {
    run?: Run;
  }
) => PromiseLike<SafeResult<OUTPUT>>;
