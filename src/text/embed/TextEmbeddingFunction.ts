import { RunFunction } from "../../run/RunFunction.js";

export type TextEmbeddingFunction<EMBEDDING> = RunFunction<
  { texts: Array<string> },
  Array<EMBEDDING>
>;
