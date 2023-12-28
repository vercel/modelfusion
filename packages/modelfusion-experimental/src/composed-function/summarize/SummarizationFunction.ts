import { FunctionOptions } from "modelfusion";

export type SummarizationFunction = (
  input: {
    text: string;
  },
  options?: FunctionOptions
) => PromiseLike<string>;
