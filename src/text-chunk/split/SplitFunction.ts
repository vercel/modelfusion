import { RunFunction } from "../../run/RunFunction.js";

export type SplitFunction = RunFunction<{ text: string }, Array<string>>;
