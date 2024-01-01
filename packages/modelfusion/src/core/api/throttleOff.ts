import { ThrottleFunction } from "./ThrottleFunction.js";

/**
 * The `throttleOff` strategy does not limit parallel API calls.
 */
export const throttleOff = (): ThrottleFunction => (fn) => fn();
