import { FunctionOptions } from "../../core/FunctionOptions.js";

export type SummarizationFunction = (
  input: {
    text: string;
  },
  options?: FunctionOptions
) => PromiseLike<string>;
