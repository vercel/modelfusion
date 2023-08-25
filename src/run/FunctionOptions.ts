import { Run } from "./Run.js";
import { FunctionObserver } from "./FunctionObserver.js";

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
  observers?: Array<FunctionObserver>;

  run?: Run;
};
