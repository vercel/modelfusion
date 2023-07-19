import { RunFunction } from "../../run/RunFunction.js";

export type SummarizationFunction = RunFunction<{ text: string }, string>;
