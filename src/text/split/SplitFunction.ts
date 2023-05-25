import { RunContext } from "run/RunContext.js";

export type SplitFunction = (
  options: {
    text: string;
  },
  context?: RunContext
) => PromiseLike<Array<string>>;
