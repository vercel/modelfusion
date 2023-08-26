import { FunctionOptions } from "../../run/FunctionOptions.js";

export type SummarizationFunction = (
  input: {
    text: string;
  },
  options?: FunctionOptions
) => PromiseLike<string>;
