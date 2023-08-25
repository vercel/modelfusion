import { Run } from "./Run.js";
import { RunFunctionObserver } from "./RunFunctionObserver.js";

/**
 * Additional settings for ModelFusion functions.
 */
export type FunctionOptions = {
  /**
   * Optional function identifier that is used in events to identify the function.
   */
  functionId?: string;

  /**
   * Observers that are called when the function is invoked.
   */
  observers?: Array<RunFunctionObserver>;

  run?: Run;
};
