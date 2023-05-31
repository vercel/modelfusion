import { RunFunction } from "../../run/RunFunction.js";

export type EmbedFunction<EMBEDDING> = RunFunction<
  { texts: Array<string> },
  Array<EMBEDDING>
>;
