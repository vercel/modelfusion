import { RunFunction } from "../../run/RunFunction.js";

export type SummarizeFunction = RunFunction<{ text: string }, string>;
