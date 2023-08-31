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
   * The logging level to use for the function. Logs are sent to the console.
   *
   * - `off` or undefined: No logging.
   * - `basic-text`: Log the timestamp and the type of event as a single line of text.
   * - `detailed-object`: Log everything except the original response as an object to the console.
   * - `detailed-json`: Log everything except the original response as a JSON string to the console.
   *
   * @default "off"
   */
  logging?: "off" | "basic-text" | "detailed-object" | "detailed-json";

  /**
   * Optional observers that are called when the function is invoked.
   */
  observers?: Array<FunctionObserver>;

  /**
   * Optional run as part of which this function is called.
   */
  run?: Run;
};
