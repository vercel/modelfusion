import { SplitFunction } from "./SplitFunction.js";

export const splitOnSeparator = async ({
  separator,
  text,
}: {
  separator: string;
  text: string;
}) => {
  return text.split(separator);
};

splitOnSeparator.asSplitFunction =
  ({ separator }: { separator: string }): SplitFunction =>
  async ({ text }: { text: string }) =>
    splitOnSeparator({
      separator,
      text,
    });
