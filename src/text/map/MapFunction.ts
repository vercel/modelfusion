import { RunContext } from "../../run/RunContext.js";

export type MapFunction = (
  options: {
    text: string;
  },
  context?: RunContext
) => PromiseLike<string>;
