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

export const splitOnSeparatorAsSplitFunction =
  ({ separator }: { separator: string }): SplitFunction =>
  async ({ text }: { text: string }) =>
    splitOnSeparator({
      separator,
      text,
    });
