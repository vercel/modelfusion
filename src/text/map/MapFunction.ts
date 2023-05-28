import { RunContext } from "../../run/RunContext.js";

export type MapFunction = (
  input: {
    text: string;
  },
  context?: RunContext
) => PromiseLike<string>;
