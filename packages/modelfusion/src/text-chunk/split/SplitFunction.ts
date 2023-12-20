import { FunctionOptions } from "../../core/FunctionOptions.js";

export type SplitFunction = (
  input: {
    text: string;
  },
  options?: FunctionOptions
) => PromiseLike<Array<string>>;
