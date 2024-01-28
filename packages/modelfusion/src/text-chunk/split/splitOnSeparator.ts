import { SplitFunction } from "./SplitFunction";

/**
 * Splits text on a separator string.
 */
export function splitOnSeparator({
  separator,
}: {
  separator: string;
}): SplitFunction {
  return async ({ text }: { text: string }) => text.split(separator);
}
