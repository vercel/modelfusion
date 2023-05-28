import { RunContext } from "run/RunContext.js";

export type SplitFunction = (
  input: {
    text: string;
  },
  context?: RunContext
) => PromiseLike<Array<string>>;
