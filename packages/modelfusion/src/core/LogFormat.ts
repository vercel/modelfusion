/**
 * The logging output format to use, e.g. for functions. Logs are sent to the console.
 *
 * - `off` or undefined: No logging.
 * - `basic-text`: Log the timestamp and the type of event as a single line of text.
 * - `detailed-object`: Log everything except the original response as an object to the console.
 * - `detailed-json`: Log everything except the original response as a JSON string to the console.
 */

export type LogFormat =
  | undefined
  | "off"
  | "basic-text"
  | "detailed-object"
  | "detailed-json";
