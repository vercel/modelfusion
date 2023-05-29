import { RunFunction } from "../../run/RunFunction.js";

export type EmbedFunction<EMBEDDING> = RunFunction<
  { value: string },
  EMBEDDING
>;
