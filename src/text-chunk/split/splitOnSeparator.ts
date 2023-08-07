import { SplitFunction } from "./SplitFunction.js";

export function splitOnSeparator({
  separator,
}: {
  separator: string;
}): SplitFunction {
  return async ({ text }: { text: string }) => text.split(separator);
}
