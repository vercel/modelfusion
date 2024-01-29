import { ThrottleFunction } from "./ThrottleFunction";

/**
 * The `throttleOff` strategy does not limit parallel API calls.
 */
export const throttleOff = (): ThrottleFunction => (fn) => fn();
