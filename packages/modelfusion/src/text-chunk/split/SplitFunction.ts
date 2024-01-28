import { FunctionOptions } from "../../core/FunctionOptions";

export type SplitFunction = (
  input: {
    text: string;
  },
  options?: FunctionOptions
) => PromiseLike<Array<string>>;
