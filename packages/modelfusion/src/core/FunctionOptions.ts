import { FunctionObserver } from "./FunctionObserver.js";
import { LogFormat } from "./LogFormat.js";
import { Run } from "./Run.js";
import { Cache } from "./cache/Cache.js";

/**
 * Additional settings for ModelFusion functions.
 */
export type FunctionOptions = {
  /**
   * Optional function identifier. Used in events and logging.
   */
  functionId?: string;

  /**
   * Optional logging to use for the function. Logs are sent to the console.
   * Overrides the global function logging setting.
   */
  logging?: LogFormat;

  /**
   * Optional observers that are called when the function is invoked.
   */
  observers?: Array<FunctionObserver>;

  /**
   * Optional cache that can be used by the function to store and retrieve cached values.
   * Not supported by all functions.
   */
  cache?: Cache;

  /**
   * Optional run as part of which this function is called. Used in events and logging.
   * Run callbacks are invoked when it is provided.
   */
  run?: Run;

  /**
   * Unique identifier of the call id of the parent function. Used in events and logging.
   *
   * It has the same name as the `callId` in `FunctionCallOptions` to allow for easy
   * propagation of the call id.
   *
   * However, in the `FunctionOptions`, it is the call ID for the parent call, and it is optional.
   */
  callId?: string | undefined;
};

/**
 * Extended options that are passed to models when functions are called. They are passed
 * into e.g. API providers to create custom headers.
 */
export type FunctionCallOptions = Omit<FunctionOptions, "callId"> & {
  functionType: string;
  callId: string;
};
